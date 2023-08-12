import { HexString } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import {
  SBigInt,
  SBool,
  SByte,
  SCollType,
  SColl as serializerSColl,
  SGroupElement,
  SigmaConstant,
  SInt,
  SLong,
  SShort,
  SSigmaProp,
  SType,
  SUnit
} from "@fleet-sdk/serializer";

/**
 * @deprecated Use {@link @fleet-sdk/serializer} instead.
 * This function will be removed from core package in v1.0.0.
 */
export function SConstant(constant: SigmaConstant): HexString {
  return constant.toHex();
}

/**
 * @deprecated Use {@link @fleet-sdk/serializer} instead.
 * This function will be removed from core package in v1.0.0.
 */
export function SParse<T>(bytes: HexString | Uint8Array): T {
  return SigmaConstant.from<T>(bytes).data;
}

/**
 * @deprecated Use {@link @fleet-sdk/serializer} instead.
 * This function will be removed from core package in v1.0.0.
 */
function SColl<T>(type: () => SType, elements: ArrayLike<T> | Uint8Array) {
  if (typeof elements === "string") {
    elements = hex.decode(elements);
  }

  return serializerSColl(type, elements as ArrayLike<number>);
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
