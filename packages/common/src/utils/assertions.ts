export type AssertErrorMessageInput = string | Error | (() => string);

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructable = Function;

type JSPrimitiveTypes =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export function assert(condition: boolean, error: AssertErrorMessageInput): asserts condition {
  if (condition) return;

  let err: Error | undefined = undefined;
  switch (typeof error) {
    case "string":
      err = new Error(error);
      break;
    case "function":
      err = new Error(error());
      break;
    default:
      err = error;
  }

  throw err;
}

export function assertTypeOf<T>(obj: T, expected: JSPrimitiveTypes): asserts obj {
  const type = typeof obj;

  if (type !== expected) {
    throw new Error(`Expected an object of type '${expected}', got '${type}'.`);
  }
}

const toString = (value: unknown) => Object.prototype.toString.call(value);
function getTypeName(value: unknown): string {
  if (value === null) return "null";
  const type = typeof value;

  return type === "object" || type === "function" ? toString(value).slice(8, -1) : type;
}

export function assertInstanceOf<T>(obj: T, expected: Constructable): asserts obj {
  const condition = obj instanceof expected;
  Object;
  if (!condition) {
    throw new Error(`Expected an instance of '${expected.name}', got '${getTypeName(obj)}'.`);
  }
}

export function isEmpty<T extends object>(obj?: T): obj is undefined;
export function isEmpty<T>(array?: T[]): array is undefined;
export function isEmpty<T>(obj?: T[] | object): obj is undefined {
  if (!obj) return true;

  return Array.isArray(obj) ? obj.length === 0 : Object.keys(obj).length === 0;
}

export function some<T extends object>(obj?: T): obj is T;
export function some<T>(array?: T[]): array is T[];
export function some<T>(obj?: T[] | object): boolean {
  return !isEmpty(obj);
}

export function isTruthy<T>(value?: T): value is NonNullable<T> {
  return !!value;
}

export function isFalsy<T>(value?: T): value is undefined {
  return !value;
}

export function isUndefined(v: unknown): v is undefined {
  return v === undefined || v === null || Number.isNaN(v);
}

export function isDefined<T>(v: T | undefined): v is T {
  return !isUndefined(v);
}

export function hasKey(o: unknown, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(o, key);
}
