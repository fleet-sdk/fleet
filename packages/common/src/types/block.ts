import { HexString } from "./common";
import { SignedTransaction } from "./transactions";

export type PoWSolution = {
  pk: HexString;
  w: HexString;
  n: string;
  d: number;
};

export type BlockHeaderId = string;

export type BlockTransactions = {
  headerId: BlockHeaderId;
  transactions: SignedTransaction[];
};

export type BlockHeader = {
  id: BlockHeaderId;
  timestamp: number;
  version: number;
  adProofsRoot: HexString;
  stateRoot: HexString;
  transactionsRoot: HexString;
  nBits: number;
  extensionHash: HexString;
  powSolutions: PoWSolution;
  height: number;
  difficulty: string;
  parentId: BlockHeaderId;
  votes: string;
  size?: number;
  extensionId?: HexString;
  transactionsId?: HexString;
  adProofsId?: HexString;
};

export type Block = {
  header: BlockHeader;
  blockTransactions: BlockTransactions;
  adProofs: unknown; // TODO
  extension: unknown; // TODO
  size: number;
};
