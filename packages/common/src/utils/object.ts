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

export type EnsureDefaultsOptions = { keepUndefinedKeys: boolean };

/**
 * Ensure that the options object has all the default values
 * @param partial
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
  partial: T | undefined,
  defaults: R,
  options?: EnsureDefaultsOptions
): R & T {
  if (isEmpty(partial)) return defaults as R & T;
  if (options?.keepUndefinedKeys) return { ...defaults, ...partial };

  const merged = { ...defaults, ...partial } as Record<string, unknown>;
  for (const key in merged) {
    merged[key] = partial[key as keyof T] ?? defaults[key as keyof R];
  }

  return merged as R & T;
}
