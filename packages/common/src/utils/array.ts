import { SortingDirection, SortingSelector } from "../types";
import { assert, isEmpty } from "./assertions";

type ObjectSelector<T> = (item: T) => T[keyof T];

export function first(array: undefined): undefined;
export function first<T>(array: ArrayLike<T>): T;
export function first<T>(array: ArrayLike<T> | undefined): T | number | undefined {
  if (!array) return undefined;
  assert(array.length > 0, "Empty array.");

  return array[0];
}

export function last(array: undefined): undefined;
export function last<T>(array: ArrayLike<T>): T;
export function last<T>(array: ArrayLike<T> | undefined): T | undefined {
  if (!array) return undefined;
  assert(array.length > 0, "Empty array.");

  return at(array, -1);
}

export function at(array: undefined, index: number): undefined;
export function at<T>(array: ArrayLike<T>, index: number): T;
export function at<T>(array: ArrayLike<T> | undefined, index: number): T | undefined {
  const len = array?.length;
  if (!len) return undefined;

  if (index < 0) {
    index += len;
  }

  return array[index];
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
export function hasDuplicatesBy<T>(array: T[], selector: ObjectSelector<T>): boolean {
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
  return [...array].sort((a: T, b: T) => {
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

export function areEqualBy<T>(
  array1: ArrayLike<T>,
  array2: ArrayLike<T>,
  selector: ObjectSelector<T>
): boolean {
  if (array1 === array2) {
    return true;
  }

  if (array1.length != array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (selector(array1[i]) !== selector(array2[i])) {
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

export function uniq<T>(array: Array<T>): Array<T> {
  if (isEmpty(array)) {
    return array;
  }

  return Array.from(new Set(array));
}

export function uniqBy<T>(
  array: Array<T>,
  selector: ObjectSelector<T>,
  selection: "keep-first" | "keep-last" = "keep-first"
): Array<T> {
  if (isEmpty(array)) {
    return array;
  }

  return Array.from(
    array
      .reduce((map, e) => {
        const key = selector(e);

        if (selection === "keep-first" && map.has(key)) {
          return map;
        }

        return map.set(key, e);
      }, new Map())
      .values()
  );
}

export function depthOf(array: unknown | unknown[]): number {
  return Array.isArray(array) ? 1 + Math.max(0, ...array.map(depthOf)) : 0;
}
