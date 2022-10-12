import { SortingDirection, SortingSelector } from "../types";

export function isEmpty<T extends object>(obj?: T): obj is undefined;
export function isEmpty<T>(array?: T[]): array is undefined;
export function isEmpty<T>(obj?: T[] | object): obj is undefined {
  if (!obj) {
    return true;
  }

  return Array.isArray(obj) ? obj.length === 0 : Object.keys(obj).length === 0;
}

export function some<T extends object>(obj?: T): obj is T;
export function some<T>(array?: T[]): array is T[];
export function some<T>(obj?: T[] | object): boolean {
  return !isEmpty(obj);
}

export function first(array: undefined): undefined;
export function first(array: Buffer): number;
export function first<T>(array: T[]): T;
export function first<T>(array?: T[] | Buffer): T | number | undefined {
  if (!array) {
    return;
  }

  if (!array[0]) {
    throw Error("Empty array.");
  }

  return array[0];
}

/**
 * Check for duplicate elements using the equality operator
 */
export function hasDuplicates<T>(array: T[]): boolean {
  return array.some((item, index) => {
    return array.indexOf(item) !== index;
  });
}

/**
 * Check for duplicate keys in complex elements
 */
export function hasDuplicatesBy<T>(array: T[], selector: (value: T) => unknown): boolean {
  return array.some((item, index) => {
    return array.findIndex((x) => selector(x) === selector(item)) !== index;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  if (array.length <= size) {
    return [array];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

export function orderBy<T>(
  array: T[],
  iteratee: SortingSelector<T>,
  order: SortingDirection = "asc"
): T[] {
  return array.sort((a: T, b: T) => {
    if (iteratee(a) > iteratee(b)) {
      return order === "asc" ? 1 : -1;
    } else if (iteratee(a) < iteratee(b)) {
      return order === "asc" ? -1 : 1;
    } else {
      return 0;
    }
  });
}
