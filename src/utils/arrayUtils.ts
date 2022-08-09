export function isEmpty<T>(array?: T[]): array is undefined {
  return !array || array.length === 0;
}

export function first(array: undefined): undefined;
export function first<T>(array: T[]): T;
export function first<T>(array?: T[]): T | undefined {
  if (!array) {
    return;
  }

  if (!array[0]) {
    throw Error("Empty array.");
  }

  return array[0];
}
