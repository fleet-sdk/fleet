import { ensureBigInt } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { SConstant } from "../sigmaConstant";
import { SPrimitiveType } from "./base";
import { BigIntInput, ByteInput } from "./constructors";

export class SBoolType extends SPrimitiveType<boolean> {
  get code(): number {
    return 0x01;
  }
}

export class SByteType extends SPrimitiveType<number> {
  get code(): number {
    return 0x02;
  }
}

export class SShortType extends SPrimitiveType<number> {
  get code(): number {
    return 0x03;
  }
}

export class SIntType extends SPrimitiveType<number> {
  get code(): number {
    return 0x04;
  }
}

export class SLongType extends SPrimitiveType<BigIntInput, bigint> {
  get code(): number {
    return 0x05;
  }

  override coerce(data: BigIntInput): bigint {
    return ensureBigInt(data);
  }
}

export class SBigIntType extends SPrimitiveType<string | bigint, bigint> {
  get code(): number {
    return 0x06;
  }

  override coerce(data: BigIntInput): bigint {
    return ensureBigInt(data);
  }
}

export class SGroupElementType extends SPrimitiveType<ByteInput, Uint8Array> {
  get code(): number {
    return 0x07;
  }

  override coerce(data: ByteInput): Uint8Array {
    return typeof data === "string" ? hex.decode(data) : data;
  }
}

export class SSigmaPropType extends SPrimitiveType<SConstant<Uint8Array>> {
  get code(): number {
    return 0x08;
  }
}
