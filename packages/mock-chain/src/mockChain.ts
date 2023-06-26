import { first, isDefined, some } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction, SParse } from "@fleet-sdk/core";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import pc from "picocolors";
import { printDiff } from "./balancePrinting";
import { execute } from "./executor";
import { MockChainParty, MockChainPartyParams } from "./mockChainParty";
import { mockHeaders } from "./objectMock";

const BLOCK_TIME_MS = 120000;

export type AssetMetadata = {
  name?: string;
  decimals?: number;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type AssetMetadataMap = Map<"nanoerg" | (string & {}), AssetMetadata>;

export type TransactionExecutionParams = {
  signers?: MockChainParty[];
  throw?: boolean;
  log?: boolean;
};

export type MockChainParams = {
  height?: number;
  timestamp?: number;
};

export class MockChain {
  private readonly _parties: MockChainParty[];
  private _height: number;
  private _timeStamp: number;
  private _assetsMetadata: AssetMetadataMap;

  constructor(height?: number);
  constructor(params?: MockChainParams);
  constructor(heightOrParams?: number | MockChainParams) {
    const params =
      !heightOrParams || typeof heightOrParams === "number"
        ? { height: heightOrParams || 0 }
        : heightOrParams;

    this._height = params.height || 0;
    this._timeStamp = params.timestamp || new Date().getTime();
    this._parties = [];
    this._assetsMetadata = new Map();
  }

  get assetsMetadata(): AssetMetadataMap {
    return this._assetsMetadata;
  }

  get height(): number {
    return this._height;
  }

  get timestamp(): number {
    return this._timeStamp;
  }

  get parties(): MockChainParty[] {
    return this._parties;
  }

  newBlock() {
    this.newBlocks(1);
  }

  newBlocks(count: number) {
    this._height += count;
    this._timeStamp += BLOCK_TIME_MS * count;
  }

  newParty(name?: string): MockChainParty;
  newParty(params?: MockChainPartyParams): MockChainParty;
  newParty(nameOrParams?: string | MockChainPartyParams): MockChainParty {
    const party = new MockChainParty(this, nameOrParams);
    this._parties.push(party);

    return party;
  }

  execute(
    unsignedTransaction: ErgoUnsignedTransaction,
    params?: TransactionExecutionParams
  ): boolean {
    const keys = (params?.signers || this._parties)
      .map((party) => party.key)
      .filter((key): key is ErgoHDKey => isDefined(key));

    const headers = mockHeaders(10, {
      fromHeight: this._height,
      fromTimeStamp: this._timeStamp
    });

    const result = execute(unsignedTransaction, keys, headers);

    if (!result.success) {
      if (params?.log) {
        log(pc.red(`${pc.bgRed("Error:")} ${result.reason}`));
      }

      if (params?.throw) {
        throw new Error(result.reason);
      }

      return false;
    }

    const preExecBalances = params?.log
      ? this._parties.map((party) => party.toString())
      : undefined;

    const { inputs, outputs } = unsignedTransaction.toPlainObject();
    for (const party of this._parties) {
      for (let i = inputs.length - 1; i >= 0; i--) {
        if (party.utxos.exists(inputs[i].boxId)) {
          party.utxos.remove(inputs[i].boxId);
          inputs.splice(i, 1);

          break;
        }
      }

      for (let i = outputs.length - 1; i >= 0; i--) {
        if (party.ergoTree === outputs[i].ergoTree) {
          party.utxos.add(outputs[i]);
          outputs.splice(i, 1);
        }
      }
    }

    this._pushAssetMetadata(unsignedTransaction);

    this.newBlock();

    if (some(preExecBalances) && result.success) {
      const postExecBalances = this._parties.map((party) => party.toString());

      log("State changes:\n");
      for (let i = 0; i < preExecBalances.length; i++) {
        printDiff(preExecBalances[i], postExecBalances[i]);
        log("\n");
      }
    }

    return true;
  }

  private _pushAssetMetadata(transaction: ErgoUnsignedTransaction) {
    const firstInputId = first(transaction.inputs).boxId;
    const box = transaction.outputs.find((output) =>
      output.assets.some((asset) => asset.tokenId === firstInputId)
    );

    if (box) {
      const name = safeEIP4Parse(box.additionalRegisters.R4);
      const decimals = safeEIP4Parse(box.additionalRegisters.R6);
      if (name) {
        this._assetsMetadata.set(firstInputId, {
          name,
          decimals: decimals ? parseInt(decimals) : undefined
        });
      }
    }

    return undefined;
  }
}

function log(str: string) {
  // eslint-disable-next-line no-console
  console.log(str);
}

function safeEIP4Parse(register: string | undefined): string | undefined {
  if (!register) {
    return undefined;
  }

  const bytes = SParse<Uint8Array>(register);
  if (bytes instanceof Uint8Array) {
    return new TextDecoder().decode(bytes);
  }

  return undefined;
}
