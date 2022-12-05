import { blake2b } from "@noble/hashes/blake2b";
import { bytesToHex } from "@noble/hashes/utils";
import { serializeErgoBox } from "../serialization/sigma/chainObjects";
import { Amount, Box, NonMandatoryRegisters, TokenAmount } from "../types";
import { ensureBigInt } from "../utils/bigIntUtils";

export class ErgoBox {
  boxId!: string;
  value!: bigint;
  ergoTree!: string;
  creationHeight!: number;
  assets!: TokenAmount<bigint>[];
  additionalRegisters!: NonMandatoryRegisters;
  transactionId!: string;
  index!: number;

  constructor(box: Box<Amount>) {
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
    const bytes = serializeErgoBox(box);
    const hash = bytesToHex(blake2b(bytes, { dkLen: 32 }));

    return box.boxId === hash;
  }
}
