export type ErrorMessage = string | Error | (() => string);

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type Constructable = Function;

type JSPrimitive =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export function assert(condition: boolean, error: ErrorMessage): asserts condition {
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

export function assertTypeOf<T>(obj: T, expected: JSPrimitive): asserts obj {
  const type = typeof obj;

  if (type !== expected) {
    throw new Error(`Expected an object of type '${expected}', got '${type}'.`);
  }
}

function getTypeName(value: unknown): string {
  if (value === null) return "null";
  const type = typeof value;

  return type === "object" || type === "function"
    ? Object.prototype.toString.call(value).slice(8, -1)
    : type;
}

export function assertInstanceOf<T>(obj: T, expected: Constructable): asserts obj {
  const condition = obj instanceof expected;

  if (!condition) {
    throw new Error(`Expected an instance of '${expected.name}', got '${getTypeName(obj)}'.`);
  }
}

export function isEmpty<T>(target: T | null | undefined): target is undefined | null {
  if (!target) return true;

  return Array.isArray(target) ? target.length === 0 : Object.keys(target).length === 0;
}

export function some<T>(target: T | null | undefined): target is T {
  return !isEmpty(target);
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
