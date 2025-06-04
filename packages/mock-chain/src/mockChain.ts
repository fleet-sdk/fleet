import { type HexString, ensureDefaults, first, isUndefined, some } from "@fleet-sdk/common";
import type { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { type ByteInput, utf8 } from "@fleet-sdk/crypto";
import { decode } from "@fleet-sdk/serializer";
import pc from "picocolors";
import type { BlockchainParameters } from "sigmastate-js/main";
import { printDiff } from "./balancePrinting";
import { BLOCKCHAIN_PARAMETERS, execute } from "./execution";
import { mockBlockchainStateContext } from "./objectMocking";
import { KeyedMockChainParty, type MockChainParty, NonKeyedMockChainParty } from "./party";

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

export type MockChainOptions = {
  height?: number;
  timestamp?: number;
  parameters?: Partial<BlockchainParameters>;
};

export type BlockState = {
  height: number;
  timestamp: number;
  parameters: BlockchainParameters;
};

export type ResetOptions = {
  clearParties?: boolean;
};

export class MockChain {
  readonly #parties: MockChainParty[];
  readonly #tip: BlockState;
  readonly #base: BlockState;
  #metadataMap: AssetMetadataMap;

  constructor();
  constructor(height?: number);
  constructor(options?: MockChainOptions);
  constructor(heightOrOptions?: number | MockChainOptions) {
    const options =
      !heightOrOptions || typeof heightOrOptions === "number"
        ? { height: heightOrOptions ?? 1 }
        : heightOrOptions;

    const state = ensureDefaults(options, {
      height: 0,
      timestamp: new Date().getTime(),
      parameters: ensureDefaults(options.parameters, BLOCKCHAIN_PARAMETERS)
    });

    this.#tip = state;
    this.#base = { ...state };
    this.#parties = [];
    this.#metadataMap = new Map();
  }

  get assetsMetadata(): AssetMetadataMap {
    return this.#metadataMap;
  }

  get height(): number {
    return this.#tip.height;
  }

  get timestamp(): number {
    return this.#tip.timestamp;
  }

  get parties(): MockChainParty[] {
    return this.#parties;
  }

  newBlock() {
    this.newBlocks(1);
  }

  newBlocks(count: number) {
    this.#tip.height += count;
    this.#tip.timestamp += BLOCK_TIME_MS * count;
  }

  jumpTo(newHeight: number) {
    this.newBlocks(newHeight - this.#tip.height);
  }

  clearUTxOSet() {
    for (const party of this.#parties) {
      party.utxos.clear();
    }
  }

  reset(options?: ResetOptions) {
    this.clearUTxOSet();
    this.#tip.height = this.#base.height;
    this.#tip.timestamp = this.#base.timestamp;

    if (options?.clearParties) {
      this.#parties.length = 0;
    }
  }

  newParty(name?: string): KeyedMockChainParty;
  newParty(nonKeyedOptions?: NonKeyedMockChainPartyOptions): NonKeyedMockChainParty;
  newParty(optOrName?: string | NonKeyedMockChainPartyOptions): MockChainParty {
    return this.#pushParty(
      typeof optOrName === "string" || isUndefined(optOrName)
        ? new KeyedMockChainParty(this, optOrName)
        : new NonKeyedMockChainParty(this, optOrName.ergoTree, optOrName.name)
    );
  }

  addParty(contractOrParty: HexString | MockChainParty, name?: string): NonKeyedMockChainParty {
    return this.#pushParty(
      typeof contractOrParty === "string"
        ? new NonKeyedMockChainParty(this, contractOrParty, name)
        : contractOrParty
    );
  }

  #pushParty<T extends MockChainParty>(party: T): T {
    this.#parties.push(party);

    return party;
  }

  execute(
    unsignedTransaction: ErgoUnsignedTransaction,
    options?: TransactionExecutionOptions,
    baseCost?: number
  ): boolean {
    const keys = (options?.signers || this.#parties)
      .filter((p): p is KeyedMockChainParty => p instanceof KeyedMockChainParty)
      .map((p) => p.key);

    const context = mockBlockchainStateContext({
      headers: {
        quantity: 10,
        fromHeight: this.#tip.height,
        fromTimestamp: this.#tip.timestamp
      }
    });

    const result = execute(unsignedTransaction, keys, {
      context,
      baseCost,
      parameters: this.#tip.parameters
    });

    if (!result.success) {
      if (options?.log) {
        log(pc.red(`${pc.bgRed(pc.bold(" Error "))} ${extractMsg(result.reason)}`));
      }

      if (options?.throw !== false) throw result.reason;
      return false;
    }

    const preExecBalances = options?.log
      ? this.#parties.map((party) => party.toString())
      : undefined;

    const { inputs, outputs } = unsignedTransaction.toPlainObject();
    for (const party of this.#parties) {
      for (let i = inputs.length - 1; i >= 0; i--) {
        if (party.utxos.exists(inputs[i].boxId)) {
          party.utxos.remove(inputs[i].boxId);
        }
      }

      for (let i = outputs.length - 1; i >= 0; i--) {
        if (party.ergoTree === outputs[i].ergoTree) {
          party.utxos.add(outputs[i]);
          outputs.splice(i, 1);
        }
      }
    }

    this.#pushMetadata(unsignedTransaction);

    this.newBlock();

    if (some(preExecBalances) && result.success) {
      const postExecBalances = this.#parties.map((party) => party.toString());

      log("State changes:\n");
      for (let i = 0; i < preExecBalances.length; i++) {
        printDiff(preExecBalances[i], postExecBalances[i]);
        log("\n");
      }
    }

    return true;
  }

  #pushMetadata(transaction: ErgoUnsignedTransaction) {
    const firstInputId = first(transaction.inputs).boxId;
    const box = transaction.outputs.find((output) =>
      output.assets.some((asset) => asset.tokenId === firstInputId)
    );
    if (!box) return;

    const name = decodeString(box.additionalRegisters.R4);
    const decimals = decodeString(box.additionalRegisters.R6);
    if (name) {
      this.#metadataMap.set(firstInputId, {
        name,
        decimals: decimals ? Number.parseInt(decimals) : undefined
      });
    }
  }
}

function log(str: string) {
  // biome-ignore lint/suspicious/noConsoleLog: for debugging purposes
  console.log(str);
}

function decodeString(bytes?: ByteInput): string | undefined {
  const c = decode<Uint8Array>(bytes);
  if (!c || c.type.toString() !== "SColl[SByte]") return;
  return utf8.encode(c.data);
}

function extractMsg(e: Error) {
  return String(e).replace("java.lang.", ""); // clean java prefix if present
}
