import { isEmpty, isUndefined } from "./assertions";

/**
 * Remove undefined values from an object
 * @param value
 *
 * @example
 * ```
 * const obj = { a: 1, b: undefined };
 * const result = clearUndefined(obj);
 * console.log(result); // { a: 1 }
 * ```
 */
export function clearUndefined(value: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key in value) {
    const val = value[key];
    if (!isUndefined(val)) {
      result[key] = val;
    }
  }

  return result;
}

/**
 * Ensure that the options object has all the default values
 * @param options
 * @param defaults
 *
 * @example
 * ```
 * const options = { a: 1 };
 * const defaults = { a: 2, b: 3 };
 * const result = ensureDefaults(options, defaults);
 * console.log(result); // { a: 1, b: 3 }
 * ```
 */
export function ensureDefaults<T extends object, R extends object>(
  options: T | undefined,
  defaults: R
): R & T {
  if (isEmpty(options)) return defaults as R & T;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newObj: any = { ...defaults, ...options };
  for (const key in newObj) {
    newObj[key as keyof object] = options[key as keyof T] ?? defaults[key as keyof R];
  }

  return newObj;
}
