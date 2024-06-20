import {
  Amount,
  Box,
  NonMandatoryRegisters,
  TokenAmount
} from "@fleet-sdk/common";
import { ensureBigInt } from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeBox } from "@fleet-sdk/serializer";

export class ErgoBox<R extends NonMandatoryRegisters = NonMandatoryRegisters> {
  boxId!: string;
  value!: bigint;
  ergoTree!: string;
  creationHeight!: number;
  assets!: TokenAmount<bigint>[];
  additionalRegisters!: R;
  transactionId!: string;
  index!: number;

  constructor(box: Box<Amount, R>) {
    this.boxId = box.boxId;
    this.ergoTree = box.ergoTree;
    this.creationHeight = box.creationHeight;
    this.value = ensureBigInt(box.value);
    this.assets = box.assets.map((asset) => ({
      tokenId: asset.tokenId,
      amount: ensureBigInt(asset.amount)
    }));
    this.additionalRegisters = box.additionalRegisters;
    this.transactionId = box.transactionId;
    this.index = box.index;
  }

  public isValid(): boolean {
    return ErgoBox.validate(this);
  }

  static validate(box: Box<Amount> | ErgoBox): boolean {
    const bytes = serializeBox(box).toBytes();
    const hash = hex.encode(blake2b256(bytes));

    return box.boxId === hash;
  }
}
