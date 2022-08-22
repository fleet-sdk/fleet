export function removeUndefined(value: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key in value) {
    const val = value[key];
    if (val !== undefined && val !== null) {
      result[key] = val;
    }
  }

  return result;
}
