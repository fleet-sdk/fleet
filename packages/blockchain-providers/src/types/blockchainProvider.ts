import type {
  Base58String,
  BlockHeader,
  Box,
  BoxId,
  DataInput,
  HexString,
  ProverResult,
  SignedTransaction,
  TokenId,
  TransactionId,
  UnsignedTransaction
} from "@fleet-sdk/common";
import type { ErgoAddress } from "@fleet-sdk/core";
import type { RequireAtLeastOne } from "type-fest";

export type BoxSource = "blockchain" | "mempool" | "blockchain+mempool";

export type BoxWhere = {
  /** Base16-encoded BoxId */
  boxId?: BoxId;

  /** Base16-encoded ErgoTree */
  ergoTree?: HexString;

  /** Base58-encoded address */
  address?: ErgoAddress | Base58String;

  /** Base16-encoded contract template hash */
  templateHash?: HexString;

  /**  Base16-encoded TokenId */
  tokenId?: TokenId;
};

export type BoxQuery<W extends BoxWhere> = {
  /** The query to filter boxes. */
  where: RequireAtLeastOne<W>;

  /**
   * The source of boxes to query.
   * @default "blockchain+mempool"
   */
  from?: BoxSource;
};

export type TransactionWhere = {
  /** Base16-encoded TransactionId */
  transactionId?: TransactionId;

  /** Base16-encoded HeaderID */
  headerId?: HexString;

  /** Base58-encoded address */
  address?: ErgoAddress | Base58String;

  /** Base16-encoded ErgoTree */
  ergoTree?: HexString;

  /** Min blockchain height */
  minHeight?: number;

  /** Only returns relevant outputs for the selected filter params */
  onlyRelevantOutputs?: boolean;
};

export type TransactionQuery<W extends TransactionWhere> = {
  /** The query to filter boxes. */
  where: RequireAtLeastOne<W, keyof Omit<W, "minHeight" | "onlyRelevantOutputs">>;

  /**
   * The source of boxes to query.
   * @default "blockchain+mempool"
   */
  from?: BoxSource;
};

export type HeaderQuery = { take: number };

export type ChainProviderBox = Box<string> & {
  confirmed: boolean;
};

export type ChainProviderUnconfirmedTransaction = {
  transactionId: TransactionId;
  inputs: ChainProviderBox & { spendingProof: ProverResult }[];
  dataInputs: DataInput[] & { index: number };
  outputs: ChainProviderBox[];
  confirmed: false;
  timestamp: number;
};

export type ChainProviderConfirmedTransaction = ChainProviderUnconfirmedTransaction & {
  confirmed: true;
  height: number;
  index: number;
  headerId: HexString;
};

export type ChainProviderTransaction =
  | ChainProviderUnconfirmedTransaction
  | ChainProviderConfirmedTransaction;

export type TransactionEvaluationError = {
  success: false;
  message: string;
};

export type TransactionEvaluationSuccess = {
  success: true;
  transactionId: TransactionId;
};

export type TransactionReductionSuccess = {
  success: true;
  reducedTransaction: HexString;
};

export type TransactionEvaluationResult =
  | TransactionEvaluationError
  | TransactionEvaluationSuccess;
export type TransactionReductionResult =
  | TransactionEvaluationError
  | TransactionReductionSuccess;

/**
 * Represents a blockchain provider that can interact with the blockchain.
 * @template B The type of the box query used by the provider.
 */
export interface IBlockchainProvider<B extends BoxWhere, T extends TransactionWhere> {
  updateUrl(url: string): void;

  /**
   * Get boxes.
   */
  getBoxes(query: BoxQuery<B>): Promise<ChainProviderBox[]>;

  /**
   * Stream boxes.
   */
  streamBoxes(query: BoxQuery<B>): AsyncIterable<ChainProviderBox[]>;

  /**
   * Stream unconfirmed transactions
   */
  streamUnconfirmedTransactions(
    query: TransactionQuery<T>
  ): AsyncIterable<ChainProviderUnconfirmedTransaction[]>;

  /**
   * Get unconfirmed transactions
   */
  getUnconfirmedTransactions(
    query: TransactionQuery<T>
  ): Promise<ChainProviderUnconfirmedTransaction[]>;

  /**
   * Stream confirmed transactions
   */
  streamConfirmedTransactions(
    query: TransactionQuery<T>
  ): AsyncIterable<ChainProviderConfirmedTransaction[]>;

  /**
   * Get confirmed transactions
   */
  getConfirmedTransactions(
    query: TransactionQuery<T>
  ): Promise<ChainProviderConfirmedTransaction[]>;

  /**
   * Get headers.
   */
  getHeaders(query: HeaderQuery): Promise<BlockHeader[]>;

  /**
   * Check for transaction validity without broadcasting it to the network.
   */
  checkTransaction(transaction: SignedTransaction): Promise<TransactionEvaluationResult>;

  /**
   * Broadcast a transaction to the network.
   */
  submitTransaction(transaction: SignedTransaction): Promise<TransactionEvaluationResult>;

  /**
   * Evaluate a transaction and return Base16-encoded evaluation result.
   */
  reduceTransaction(
    transaction: UnsignedTransaction
  ): Promise<TransactionReductionResult>;
}
