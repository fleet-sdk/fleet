import { isDefined } from "../../utils/objectUtils";
import { SigmaTypeCode } from "./sigmaTypeCode";

export interface ISigmaType {
  readonly type: SigmaTypeCode;
}

export interface IPrimarySigmaType<T> extends ISigmaType {
  value: T;
}

export interface ISigmaCollection<T> extends ISigmaType {
  value: ArrayLike<T>;
  elementsType: SigmaTypeCode;
}

export function SByte(value: number): IPrimarySigmaType<number>;
export function SByte(): SigmaTypeCode;
export function SByte(value?: number): IPrimarySigmaType<number> | SigmaTypeCode {
  return SPrimaryType(SigmaTypeCode.Byte, value);
}

export function SBool(value: boolean): IPrimarySigmaType<boolean>;
export function SBool(): SigmaTypeCode;
export function SBool(value?: boolean): IPrimarySigmaType<boolean> | SigmaTypeCode {
  return SPrimaryType(SigmaTypeCode.Boolean, value);
}

export function SShort(value: number): IPrimarySigmaType<number>;
export function SShort(): SigmaTypeCode;
export function SShort(value?: number): IPrimarySigmaType<number> | SigmaTypeCode {
  return SPrimaryType(SigmaTypeCode.Short, value);
}

export function SInt(value: number): IPrimarySigmaType<number>;
export function SInt(): SigmaTypeCode;
export function SInt(value?: number): IPrimarySigmaType<number> | SigmaTypeCode {
  return SPrimaryType(SigmaTypeCode.Int, value);
}

export function SLong(value: number): IPrimarySigmaType<number>;
export function SLong(): SigmaTypeCode;
export function SLong(value?: number): IPrimarySigmaType<number> | SigmaTypeCode {
  return SPrimaryType(SigmaTypeCode.Long, value);
}

function SPrimaryType<T>(type: SigmaTypeCode, value?: T): IPrimarySigmaType<T> | SigmaTypeCode {
  if (isDefined(value)) {
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
