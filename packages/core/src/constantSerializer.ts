import { HexString } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import {
  SBigInt,
  SBool,
  SByte,
  SCollType,
  SConstant as serializerConstant,
  SParse as serializerParse,
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
export function SConstant(content: SigmaConstant): HexString {
  return serializerConstant(content);
}

/**
 * @deprecated Use {@link @fleet-sdk/serializer} instead.
 * This function will be removed from core package in v1.0.0.
 */
export function SParse<T>(content: HexString | Uint8Array): T {
  return serializerParse(content);
}

function SColl<T>(type: () => SType, elements: ArrayLike<T> | Uint8Array) {
  if (typeof elements === "string") {
    elements = hex.decode(elements);
  }

  return serializerSColl(type, elements);
}

export {
  /** @deprecated */ SBigInt,
  /** @deprecated */ SBool,
  /** @deprecated */ SByte,
  /** @deprecated */ SCollType,
  /** @deprecated */ SColl,
  /** @deprecated */ SGroupElement,
  /** @deprecated */ SInt,
  /** @deprecated */ SLong,
  /** @deprecated */ SShort,
  /** @deprecated */ SSigmaProp,
  /** @deprecated */ SType,
  /** @deprecated */ SUnit
};
