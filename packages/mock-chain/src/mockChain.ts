import { bytesToUtf8, first, HexString, isUndefined, some } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction, SParse } from "@fleet-sdk/core";
import { bgRed, bold, red } from "picocolors";
import { printDiff } from "./balancePrinting";
import { execute } from "./executor";
import { mockHeaders } from "./objectMocking";
import { KeyedMockChainParty, MockChainParty, NonKeyedMockChainParty } from "./party";

const BLOCK_TIME_MS = 120000;

export type AssetMetadata = {
  name?: string;
  decimals?: number;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type AssetMetadataMap = Map<"nanoerg" | (string & {}), AssetMetadata>;

export type NonKeyedMockChainPartyOptions = {
  name?: string;
  ergoTree: string;
};

export type TransactionExecutionOptions = {
  signers?: KeyedMockChainParty[];
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

  jumpTo(newHeight: number) {
    this.newBlocks(newHeight - this._height);
  }

  clearUTxOSet() {
    for (const party of this._parties) {
      party.utxos.clear();
    }
  }

  newParty(name?: string): KeyedMockChainParty;
  newParty(nonKeyedOptions?: NonKeyedMockChainPartyOptions): NonKeyedMockChainParty;
  newParty(optOrName?: string | NonKeyedMockChainPartyOptions): MockChainParty {
    return this._pushParty(
      typeof optOrName === "string" || isUndefined(optOrName)
        ? new KeyedMockChainParty(this, optOrName)
        : new NonKeyedMockChainParty(this, optOrName.ergoTree, optOrName.name)
    );
  }

  addParty(ergoTree: HexString, name?: string): NonKeyedMockChainParty {
    return this._pushParty(new NonKeyedMockChainParty(this, ergoTree, name));
  }

  private _pushParty<T extends MockChainParty>(party: T): T {
    this._parties.push(party);

    return party;
  }

  execute(
    unsignedTransaction: ErgoUnsignedTransaction,
    options?: TransactionExecutionOptions
  ): boolean {
    const keys = (options?.signers || this._parties)
      .filter((party): party is KeyedMockChainParty => party instanceof KeyedMockChainParty)
      .map((party) => party.key);

    const headers = mockHeaders(10, {
      fromHeight: this._height,
      fromTimeStamp: this._timeStamp
    });

    const result = execute(unsignedTransaction, keys, headers);

    if (!result.success) {
      if (options?.log) {
        log(red(`${bgRed(bold(" Error "))} ${result.reason}`));
      }

      if (options?.throw != false) {
        throw new Error(result.reason);
      }

      return false;
    }

    const preExecBalances = options?.log
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
      const name = safeParseSColl(box.additionalRegisters.R4);
      const decimals = safeParseSColl(box.additionalRegisters.R6);
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

function safeParseSColl(register: string | undefined): string | undefined {
  if (register) {
    const bytes = SParse<Uint8Array>(register);
    if (bytes instanceof Uint8Array) {
      return bytesToUtf8(bytes);
    }
  }

  return undefined;
}
