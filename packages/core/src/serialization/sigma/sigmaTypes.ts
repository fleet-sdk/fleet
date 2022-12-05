import { ensureBigInt } from "../../utils/bigIntUtils";
import { isDefined } from "../../utils/objectUtils";
import { SigmaTypeCode } from "./sigmaTypeCode";

export interface ISigmaType {
  readonly type: SigmaTypeCode;
}

export interface IPrimitiveSigmaType<T> extends ISigmaType {
  value: T;
}

export interface ISigmaCollection<T> extends ISigmaType {
  value: ArrayLike<T>;
  elementsType: SigmaTypeCode;
}

export function SByte(value: number): IPrimitiveSigmaType<number>;
export function SByte(): SigmaTypeCode;
export function SByte(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Byte, value);
}

export function SBool(value: boolean): IPrimitiveSigmaType<boolean>;
export function SBool(): SigmaTypeCode;
export function SBool(value?: boolean): IPrimitiveSigmaType<boolean> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Boolean, value);
}

export function SShort(value: number): IPrimitiveSigmaType<number>;
export function SShort(): SigmaTypeCode;
export function SShort(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Short, value);
}

export function SInt(value: number): IPrimitiveSigmaType<number>;
export function SInt(): SigmaTypeCode;
export function SInt(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Int, value);
}

export function SLong(value: number | string | bigint): IPrimitiveSigmaType<bigint>;
export function SLong(): SigmaTypeCode;
export function SLong(
  value?: number | string | bigint
): IPrimitiveSigmaType<bigint> | SigmaTypeCode {
  return _createPrimitiveType(
    SigmaTypeCode.Long,
    isDefined(value) ? ensureBigInt(value) : undefined
  );
}

export function SBigInt(value: string | bigint): IPrimitiveSigmaType<bigint>;
export function SBigInt(): SigmaTypeCode;
export function SBigInt(value?: string | bigint): IPrimitiveSigmaType<bigint> | SigmaTypeCode {
  return _createPrimitiveType(
    SigmaTypeCode.BigInt,
    isDefined(value) ? ensureBigInt(value) : undefined
  );
}

export function SUnit(): IPrimitiveSigmaType<null>;
export function SUnit(): SigmaTypeCode;
export function SUnit(): IPrimitiveSigmaType<null> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Unit, null);
}

export function SGroupElement(value: Uint8Array): IPrimitiveSigmaType<Uint8Array>;
export function SGroupElement(): SigmaTypeCode;
export function SGroupElement(value?: Uint8Array): IPrimitiveSigmaType<Uint8Array> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.GroupElement, value);
}

export function SSigmaProp(value: IPrimitiveSigmaType<Uint8Array>): IPrimitiveSigmaType<ISigmaType>;
export function SSigmaProp(): SigmaTypeCode;
export function SSigmaProp(
  value?: IPrimitiveSigmaType<Uint8Array>
): IPrimitiveSigmaType<ISigmaType> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.SigmaProp, value);
}

function _createPrimitiveType<T>(
  type: SigmaTypeCode,
  value?: T
): IPrimitiveSigmaType<T> | SigmaTypeCode {
  if (value !== undefined) {
    return { type, value };
  } else {
    return type;
  }
}

export function SColl<T>(type: () => SigmaTypeCode, elements: ArrayLike<T>): ISigmaCollection<T> {
  return {
    type: SigmaTypeCode.Coll,
    elementsType: type(),
    value: elements
  };
}
