import { Amount, Box, HexString, NonMandatoryRegisters, TokenAmount } from "@fleet-sdk/common";
import { ensureBigInt } from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeBox } from "@fleet-sdk/serializer";

export type OnlyR4Register = {
  R4: HexString;
  R5?: HexString;
  R6?: HexString;
  R7?: HexString;
  R8?: HexString;
  R9?: HexString;
};

export type R4ToR5Registers = {
  R4: HexString;
  R5: HexString;
  R6?: HexString;
  R7?: HexString;
  R8?: HexString;
  R9?: HexString;
};

export type R4ToR6Registers = {
  R4: HexString;
  R5: HexString;
  R6: HexString;
  R7?: HexString;
  R8?: HexString;
  R9?: HexString;
};

export type R4ToR7Registers = {
  R4: HexString;
  R5: HexString;
  R6: HexString;
  R7: HexString;
  R8?: HexString;
  R9?: HexString;
};

export type R4ToR8Registers = {
  R4: HexString;
  R5: HexString;
  R6: HexString;
  R7: HexString;
  R8: HexString;
  R9?: HexString;
};

export type R4ToR9Registers = {
  R4: HexString;
  R5: HexString;
  R6: HexString;
  R7: HexString;
  R8: HexString;
  R9: HexString;
};

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
