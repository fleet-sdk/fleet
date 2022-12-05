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
export function first(array: Uint8Array): number;
export function first<T>(array: ArrayLike<T>): T;
export function first<T>(array?: ArrayLike<T> | Uint8Array): T | number | undefined {
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

export function areEqual<T>(array1: ArrayLike<T>, array2: ArrayLike<T>): boolean {
  if (array1 === array2) {
    return true;
  }

  if (array1.length != array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

export function startsWith<T>(array: ArrayLike<T>, target: ArrayLike<T>): boolean {
  if (array === target) {
    return true;
  }

  if (target.length > array.length) {
    return false;
  }

  for (let i = 0; i < target.length; i++) {
    if (target[i] !== array[i]) {
      return false;
    }
  }

  return true;
}

export function endsWith<T>(array: ArrayLike<T>, target: ArrayLike<T>): boolean {
  if (array === target) {
    return true;
  }

  if (target.length > array.length) {
    return false;
  }

  const offset = array.length - target.length;

  for (let i = target.length - 1; i >= 0; i--) {
    if (target[i] !== array[i + offset]) {
      return false;
    }
  }

  return true;
}
