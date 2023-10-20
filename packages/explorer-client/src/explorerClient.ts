import { BlockHeader, BoxWhere, ChainClientBox, IChainDataClient } from "packages/common/dist";

export class ExplorerClient implements IChainDataClient<BoxWhere> {
  getUnspentBoxes(): Promise<ChainClientBox[]> {
    throw new Error("Method not implemented.");
  }
  getLastHeaders(): Promise<BlockHeader[]> {
    throw new Error("Method not implemented.");
  }
  checkTransaction(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  submitTransaction(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  reduceTransaction(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
