import type { HexString } from "@fleet-sdk/common";
import {
  SBigInt,
  SBool,
  SByte,
  SColl,
  SCollType,
  SGroupElement,
  SInt,
  SLong,
  SShort,
  SSigmaProp,
  SType,
  SUnit,
  SConstant as SerSConstant
} from "@fleet-sdk/serializer";

/**
 * @deprecated Use {@link @fleet-sdk/serializer} instead.
 * This function will be removed from core package in v1.0.0.
 */
export function SConstant(constant: SerSConstant): HexString {
  return constant.toHex();
}

/**
 * @deprecated Use {@link @fleet-sdk/serializer} instead.
 * This function will be removed from core package in v1.0.0.
 */
export function SParse<T>(bytes: HexString | Uint8Array): T {
  return SerSConstant.from<T>(bytes).data;
}

export {
  SBigInt,
  SBool,
  SByte,
  SCollType,
  SColl,
  SGroupElement,
  SInt,
  SLong,
  SShort,
  SSigmaProp,
  SType,
  SUnit
};
