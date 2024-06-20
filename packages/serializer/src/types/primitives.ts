import { ensureBigInt } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import type { SConstant } from "../sigmaConstant";
import { SPrimitiveType } from "./base";
import type { BigIntInput, ByteInput } from "./constructors";

export class SBoolType extends SPrimitiveType<boolean> {
  get code(): 0x01 {
    return 0x01;
  }

  toString(): string {
    return "SBool";
  }
}

export class SByteType extends SPrimitiveType<number> {
  get code(): 0x02 {
    return 0x02;
  }

  toString(): string {
    return "SByte";
  }
}

export class SShortType extends SPrimitiveType<number> {
  get code(): 0x03 {
    return 0x03;
  }

  toString(): string {
    return "SShort";
  }
}

export class SIntType extends SPrimitiveType<number> {
  get code(): 0x04 {
    return 0x04;
  }

  toString(): string {
    return "SInt";
  }
}

export class SLongType extends SPrimitiveType<BigIntInput, bigint> {
  get code(): 0x05 {
    return 0x05;
  }

  override coerce(data: BigIntInput): bigint {
    return ensureBigInt(data);
  }

  toString(): string {
    return "SLong";
  }
}

export class SBigIntType extends SPrimitiveType<string | bigint, bigint> {
  get code(): number {
    return 0x06;
  }

  override coerce(data: BigIntInput): bigint {
    return ensureBigInt(data);
  }

  toString(): string {
    return "SBigInt";
  }
}

export class SGroupElementType extends SPrimitiveType<ByteInput, Uint8Array> {
  get code(): 0x07 {
    return 0x07;
  }

  override coerce(data: ByteInput): Uint8Array {
    return typeof data === "string" ? hex.decode(data) : data;
  }

  toString(): string {
    return "SGroupElement";
  }
}

export class SSigmaPropType extends SPrimitiveType<SConstant<Uint8Array>> {
  get code(): 0x08 {
    return 0x08;
  }

  toString(): string {
    return "SSigmaProp";
  }
}
