import type {
  Amount,
  BoxCandidate,
  NonMandatoryRegisters,
  TokenAmount
} from "@fleet-sdk/common";
import { ensureBigInt } from "@fleet-sdk/common";
import type { TransactionOutputFlags } from "../builder";
import { ErgoBox } from "./ergoBox";

export class ErgoBoxCandidate<R extends NonMandatoryRegisters = NonMandatoryRegisters> {
  value: bigint;
  ergoTree: string;
  creationHeight: number;
  assets: TokenAmount<bigint>[];
  additionalRegisters: R;
  flags?: TransactionOutputFlags;

  constructor(candidate: BoxCandidate<Amount, R>, flags?: TransactionOutputFlags) {
    this.ergoTree = candidate.ergoTree;
    this.creationHeight = candidate.creationHeight;
    this.value = ensureBigInt(candidate.value);
    this.assets = candidate.assets.map((asset) => ({
      tokenId: asset.tokenId,
      amount: ensureBigInt(asset.amount)
    }));
    this.additionalRegisters = candidate.additionalRegisters;
    this.flags = flags;
  }

  toBox(transactionId: string, index: number): ErgoBox<R> {
    return new ErgoBox(this, transactionId, index);
  }

  toPlainObject(): BoxCandidate<string> {
    return {
      value: this.value.toString(),
      ergoTree: this.ergoTree,
      creationHeight: this.creationHeight,
      assets: this.assets.map((asset) => ({
        tokenId: asset.tokenId,
        amount: asset.amount.toString()
      })),
      additionalRegisters: this.additionalRegisters
    };
  }
}
