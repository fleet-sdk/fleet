import { RequireAtLeastOne } from "type-fest";
import { TransactionId } from "../../dist";
import { BlockHeader } from "./block";
import { Box } from "./boxes";
import { HexString } from "./common";
import { SignedTransaction, UnsignedTransaction } from "./transactions";

export type QueryBase = {
  take?: number;
  skip?: number;
};

export type BoxQuery<W extends BoxWhere> = {
  where: RequireAtLeastOne<W>;

  /**
   * Determines if it should include unspent boxes from the mempool.
   * @default true
   */
  includeUnconfirmed?: boolean;
} & QueryBase;

export type BoxWhere = {
  /** Base16-encoded BoxId */
  boxId?: HexString;

  /** Base16-encoded ErgoTree or Base58-encoded address */
  contract?: HexString;

  /** Base16-encoded contract template */
  template?: HexString;

  /**  Base16-encoded TokenId */
  tokenId?: HexString;
};

export type ChainClientBox = Box<bigint> & {
  confirmed: boolean;
};

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

export type TransactionEvaluationResult = TransactionEvaluationError | TransactionEvaluationSuccess;
export type TransactionReductionResult = TransactionEvaluationError | TransactionReductionSuccess;

export interface IChainDataProvider<B extends BoxWhere> {
  /**
   * Get unspent boxes from the blockchain.
   */
  getUnspentBoxes(query: BoxQuery<B>): Promise<ChainClientBox[]>;

  /**
   * Get the last `n` block headers from the blockchain.
   */
  getLastHeaders(count: number): Promise<BlockHeader[]>;

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
  reduceTransaction(transaction: UnsignedTransaction): Promise<TransactionReductionResult>;
}
