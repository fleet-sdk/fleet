export function removeUndefined(value: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key in value) {
    const val = value[key];
    if (!isUndefined(val)) {
      result[key] = val;
    }
  }

  return result;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined || value === null || Number.isNaN(value);
}

export function isDefined<T>(value: T | undefined): value is T {
  return !isUndefined(value);
}

export function hasKey(o: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(o, key);
}
