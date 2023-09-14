import {
  BlockHeader,
  BoxQuery,
  BoxWhere,
  ChainClientBox,
  IChainDataClient,
  SignedTransaction,
  UnsignedTransaction
} from "packages/common/src";
import { HexString } from "sigmastate-js/main";

export class GraphqlClient implements IChainDataClient<BoxWhere> {
  getUnspentBoxes(query: BoxQuery<BoxWhere>): Promise<ChainClientBox[]> {
    throw new Error("Method not implemented.");
  }
  getLastHeaders(count: number): Promise<BlockHeader[]> {
    throw new Error("Method not implemented.");
  }
  checkTransaction(transaction: SignedTransaction): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  submitTransaction(transaction: SignedTransaction): Promise<string> {
    throw new Error("Method not implemented.");
  }
  reduceTransaction(transaction: UnsignedTransaction): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export type ExtentedBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees or Base58-encoded addresses */
  contracts?: HexString[];
};

export type ExtendedBoxQuery = BoxQuery<ExtentedBoxWhere>;
