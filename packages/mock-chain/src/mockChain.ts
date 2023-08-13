import { ensureDefaults, first, HexString, isUndefined, some } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { utf8 } from "@fleet-sdk/crypto";
import { parse } from "@fleet-sdk/serializer";
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

export type BlockState = Required<MockChainParams>;

export class MockChain {
  private readonly _parties: MockChainParty[];
  private readonly _tip: BlockState;
  private readonly _bottom: BlockState;
  private _assetsMetadata: AssetMetadataMap;

  constructor();
  constructor(height?: number);
  constructor(params?: MockChainParams);
  constructor(heightOrParams?: number | MockChainParams) {
    const state =
      !heightOrParams || typeof heightOrParams === "number"
        ? { height: heightOrParams ?? 0, timestamp: new Date().getTime() }
        : ensureDefaults(heightOrParams, { height: 0, timestamp: new Date().getTime() });

    this._tip = state;
    this._bottom = { ...state };
    this._parties = [];
    this._assetsMetadata = new Map();
  }

  get assetsMetadata(): AssetMetadataMap {
    return this._assetsMetadata;
  }

  get height(): number {
    return this._tip.height;
  }

  get timestamp(): number {
    return this._tip.timestamp;
  }

  get parties(): MockChainParty[] {
    return this._parties;
  }

  newBlock() {
    this.newBlocks(1);
  }

  newBlocks(count: number) {
    this._tip.height += count;
    this._tip.timestamp += BLOCK_TIME_MS * count;
  }

  jumpTo(newHeight: number) {
    this.newBlocks(newHeight - this._tip.height);
  }

  clearUTxOSet() {
    for (const party of this._parties) {
      party.utxos.clear();
    }
  }

  reset() {
    this.clearUTxOSet();
    this._tip.height = this._bottom.height;
    this._tip.timestamp = this._bottom.timestamp;
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
      fromHeight: this._tip.height,
      fromTimestamp: this._tip.timestamp
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
  if (!register) return;

  const bytes = parse<Uint8Array>(register, "safe");
  if (bytes instanceof Uint8Array) {
    return utf8.encode(bytes);
  }

  return;
}
