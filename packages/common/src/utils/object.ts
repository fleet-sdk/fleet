import { isEmpty, isUndefined } from "./assertions";

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
