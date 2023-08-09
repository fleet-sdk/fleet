import { ensureBigInt, isDefined } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";

export const enum ConstructorCode {
  Embeddable = 0,

  SimpleColl = 1,
  NestedColl = 2,

  Option = 3,
  OptionCollection = 4,

  PairOne = 5,
  PairTwo = 6,
  SymmetricPair = 7,
  GenericTuple = 8
}

const MAX_PRIMITIVE_TYPE_CODE = 0x0b;
export const PRIMITIVE_TYPE_RANGE = MAX_PRIMITIVE_TYPE_CODE + 0x01;

const typeCodeOf = (constructor: ConstructorCode) => PRIMITIVE_TYPE_RANGE * constructor;

export abstract class SType {
  abstract get code(): number;
  abstract get embeddable(): boolean;
}

export class SPrimitiveType<I, O = I> implements SType {
  private readonly _code: number;
  private readonly _coercionFn: (value: I) => O;

  constructor(code: number, coercion: (value: I) => O) {
    this._code = code;
    this._coercionFn = coercion;
  }

  get code() {
    return this._code;
  }

  get embeddable(): boolean {
    return true;
  }

  coerce(value: I): O {
    return this._coercionFn(value);
  }
}

export class SMonomorphicType<I, O = I> implements SType {
  private readonly _code: number;
  private readonly _coercionFn: (value: I) => O;

  constructor(code: number, coercion: (value: I) => O) {
    this._code = code;
    this._coercionFn = coercion;
  }

  get code() {
    return this._code;
  }

  get embeddable(): boolean {
    return false;
  }

  coerce(value: I): O {
    return this._coercionFn(value);
  }
}

export abstract class SGenericType<T extends SType> implements SType {
  abstract get code(): number;
  abstract get elementsType(): T | T[];

  get embeddable(): boolean {
    return false;
  }
}

export class SCollType<T extends SType = SType> extends SGenericType<T> {
  private readonly _internalType: T;

  constructor(type: T) {
    super();
    this._internalType = type;
  }

  get code(): number {
    return sDescriptors.coll.code;
  }

  get elementsType(): T {
    return this._internalType;
  }
}

export class STupleType<T extends SType = SType> extends SGenericType<T> {
  private readonly _internalType: T[];

  constructor(type: T[]) {
    super();
    this._internalType = type;
  }

  get code(): number {
    return sDescriptors.tuple.code;
  }

  get elementsType(): T[] {
    return this._internalType;
  }
}

export interface ISigmaTypeBase {
  readonly code: number;

  readonly embeddable: boolean;
  readonly primitive: boolean;
}

type BigIntInput = number | string | bigint;
type ByteInput = Uint8Array | string;

const noCoercion = <T>(input: T) => input;
const ensureBytes = (input: ByteInput) => (typeof input === "string" ? hex.decode(input) : input);

const sCollDescriptor = Object.freeze({
  code: typeCodeOf(ConstructorCode.SimpleColl),
  simpleCollTypeCode: typeCodeOf(ConstructorCode.SimpleColl),
  nestedCollTypeCode: typeCodeOf(ConstructorCode.NestedColl),
  embeddable: false,
  isConstructorOf(typeCode: number): boolean {
    return (
      typeCode >= sDescriptors.coll.simpleCollTypeCode &&
      typeCode <= sDescriptors.coll.nestedCollTypeCode + MAX_PRIMITIVE_TYPE_CODE
    );
  }
}) satisfies SType;

const sTupleDescriptor = Object.freeze({
  code: typeCodeOf(ConstructorCode.PairOne),
  pairOneTypeCode: typeCodeOf(ConstructorCode.PairOne),
  pairTwoTypeCode: typeCodeOf(ConstructorCode.PairTwo),
  tripleTypeCode: typeCodeOf(ConstructorCode.PairTwo),
  symmetricPairTypeCode: typeCodeOf(ConstructorCode.SymmetricPair),
  quadrupleTypeCode: typeCodeOf(ConstructorCode.SymmetricPair),
  genericTupleTypeCode: typeCodeOf(ConstructorCode.GenericTuple),
  embeddable: false,
  isConstructorOf(typeCode: number) {
    return typeCode >= this.pairOneTypeCode && typeCode <= this.genericTupleTypeCode;
  }
}) satisfies SType;

export const sDescriptors = {
  bool: new SPrimitiveType<boolean>(0x01, noCoercion),
  byte: new SPrimitiveType<number>(0x02, noCoercion),
  short: new SPrimitiveType<number>(0x03, noCoercion),
  int: new SPrimitiveType<number>(0x04, noCoercion),
  long: new SPrimitiveType<BigIntInput, bigint>(0x05, ensureBigInt),
  bigInt: new SPrimitiveType<BigIntInput, bigint>(0x06, ensureBigInt),
  groupElement: new SPrimitiveType<ByteInput, Uint8Array>(0x07, ensureBytes),
  sigmaProp: new SPrimitiveType<SigmaConstant<Uint8Array>>(0x08, noCoercion),
  unit: new SMonomorphicType<null>(0x62, noCoercion),
  coll: sCollDescriptor,
  tuple: sTupleDescriptor
} satisfies { [key: string]: SType };

export class SigmaConstant<V = unknown, T extends SType = SType> {
  private readonly _type!: T;
  private readonly _value!: V;

  constructor(type: T, value: V) {
    this._type = type;
    this._value = value;
  }

  get type(): T {
    return this._type;
  }

  get value(): V {
    return this._value;
  }
}

export function SByte(value: number): SigmaConstant<number>;
export function SByte(value?: number): typeof sDescriptors.byte;
export function SByte(value?: number) {
  return createPrimitiveValue(sDescriptors.byte, value);
}

export function SBool(value: boolean): SigmaConstant<boolean>;
export function SBool(value?: boolean): typeof sDescriptors.bool;
export function SBool(value?: boolean) {
  return createPrimitiveValue(sDescriptors.bool, value);
}

export function SShort(value: number): SigmaConstant<number>;
export function SShort(value?: number): typeof sDescriptors.short;
export function SShort(value?: number) {
  return createPrimitiveValue(sDescriptors.short, value);
}

export function SInt(value: number): SigmaConstant<number>;
export function SInt(value?: number): typeof sDescriptors.int;
export function SInt(value?: number) {
  return createPrimitiveValue(sDescriptors.int, value);
}

export function SLong(value: number | string | bigint): SigmaConstant<bigint>;
export function SLong(value?: number | string | bigint): typeof sDescriptors.long;
export function SLong(value?: number | string | bigint) {
  return createPrimitiveValue(
    sDescriptors.long,
    isDefined(value) ? sDescriptors.long.coerce(value) : undefined
  );
}

export function SBigInt(value: string | bigint): SigmaConstant<bigint>;
export function SBigInt(value?: string | bigint): typeof sDescriptors.bigInt;
export function SBigInt(value?: string | bigint) {
  return createPrimitiveValue(
    sDescriptors.bigInt,
    isDefined(value) ? sDescriptors.bigInt.coerce(value) : undefined
  );
}

export function SUnit(): SigmaConstant<null>;
export function SUnit(): typeof sDescriptors.unit;
export function SUnit() {
  return createPrimitiveValue(sDescriptors.unit, null);
}

export function SGroupElement(value: Uint8Array | string): SigmaConstant<Uint8Array>;
export function SGroupElement(value?: Uint8Array | string): typeof sDescriptors.groupElement;
export function SGroupElement(value?: Uint8Array | string) {
  return createPrimitiveValue(sDescriptors.groupElement, value);
}

export function SSigmaProp(
  value: SigmaConstant<Uint8Array>
): SigmaConstant<SigmaConstant<Uint8Array>>;
export function SSigmaProp(value?: SigmaConstant<Uint8Array>): typeof sDescriptors.sigmaProp;
export function SSigmaProp(value?: SigmaConstant<Uint8Array>) {
  return createPrimitiveValue(sDescriptors.sigmaProp, value);
}

function createPrimitiveValue<T>(
  type: SPrimitiveType<T> | SMonomorphicType<T>,
  value?: T
): SigmaConstant<T> | SType {
  return value !== undefined ? new SigmaConstant(type, type.coerce(value)) : type;
}

export type SConstructor<T> = (arg?: T) => SType | SCollType<SType>;

type SCollConstant<T> = SigmaConstant<ArrayLike<T>>;

export function SColl<T>(type: SConstructor<T>): SConstructor<ArrayLike<T>>;
export function SColl<T>(
  type: SConstructor<T>,
  items?: ArrayLike<T> | Uint8Array
): SCollConstant<T>;
export function SColl<T>(
  type: SConstructor<T>,
  items?: ArrayLike<T> | Uint8Array
): SCollConstant<T> | SConstructor<ArrayLike<T>> {
  const elementsType = type();
  if (!items) {
    return () => new SCollType(elementsType);
  }

  if (elementsType.code === sDescriptors.byte.code) {
    if (!(items instanceof Uint8Array)) {
      items = Uint8Array.from(items as ArrayLike<number>);
    }
  }

  return new SigmaConstant(new SCollType(elementsType), items as ArrayLike<T>);
}

export function STuple(...items: SigmaConstant[]) {
  return new SigmaConstant(
    new STupleType(items.map((x) => x.type)),
    items.map((x) => x.value)
  );
}

// export function SPair<L extends SigmaConstant, R extends SigmaConstant>(
//   left: L,
//   right: R
// ): SigmaConstant<[L, R]> {
//   return STuple(left, right); // new SigmaConstant(descriptors.sigmaTuple, [left, right]);
// }

// SPair(SInt(1), SBool(false)).value[1].value

// const fskdj = STuple(SInt(1), SBool(false));

// const t = SColl(STuple(SInt, SInt), [1, true]).value[0];

// SColl(SColl(SByte), [
//   hex.decode("4c657427732063656c656272617465204572676f526166666c652120"),
//   hex.decode("4c657427732063656c656272617465204572676f526166666c652120"),
//   hex.decode("e730bbae0463346f8ce72be23ab8391d1e7a58f48ed857fcf4ee9aecf6915307")
// ]);

// SColl(SInt, hex.decode("deadbeef")); // should fail

// SColl(SGroupElement, [Uint8Array.from([1])]);
// SColl(SGroupElement, ["deaadbeaf", "cafebabe"]);
// SColl(SByte, hex.decode("deadbeef"));
// // console.log(SColl(SInt, Uint8Array.from([1])));
// SColl(SBigInt, [1n, "1"]);
// SColl(SBigInt, [1n, "1", 1]);
// SColl(SBool, [true, false, 1]);
// const t = SColl(SBool);
// SColl(SColl(SBool), [[true, true], [false]]);
// SColl(SColl(SColl(SBool)), [
//   [
//     [false, true],
//     [true, false, false]
//   ]
// ]);

// const ret = SColl(SColl(SColl(SBigInt)), [[[1n, "1"]]]);
