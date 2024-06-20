import { SortingDirection, SortingSelector } from "../types";
import { assert, isEmpty } from "./assertions";

type ObjectSelector<T> = (item: T) => T[keyof T];

/**
 * Returns the first element of an array.
 * @param array
 * @throws an error if the array is empty.
 */
export function first(array: undefined): undefined;
export function first<T>(array: ArrayLike<T>): T;
export function first<T>(
  array: ArrayLike<T> | undefined
): T | number | undefined {
  if (!array) return undefined;
  assert(array.length > 0, "Empty array.");

  return array[0];
}

/**
 * Returns the last element of an array.
 * @param array
 * @throws an error if the array is empty.
 */
export function last(array: undefined): undefined;
export function last<T>(array: ArrayLike<T>): T;
export function last<T>(array: ArrayLike<T> | undefined): T | undefined {
  if (!array) return undefined;
  assert(array.length > 0, "Empty array.");

  return at(array, -1);
}

/**
 * Returns the element at the specified index. Negative indices are counted from the end of the array.
 * @param array
 * @param index
 */
export function at(array: undefined, index: number): undefined;
export function at<T>(array: ArrayLike<T>, index: number): T;
export function at<T>(
  array: ArrayLike<T> | undefined,
  index: number
): T | undefined {
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
export function hasDuplicatesBy<T>(
  array: T[],
  selector: ObjectSelector<T>
): boolean {
  return array.some((item, index) => {
    return array.findIndex((x) => selector(x) === selector(item)) !== index;
  });
}

/**
 * Turns an array into chunks of the specified size
 * @param array
 * @param size
 *
 * @example
 * ```
 * const array = [1, 2, 3, 4, 5];
 * const chunks = chunk(array, 2);
 * console.log(chunks);
 * // [[1, 2], [3, 4], [5]]
 * ```
 */
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

/**
 * Sorts an array of objects by the specified property
 * @param array
 * @param iteratee
 * @param order
 *
 * @example
 * ```
 * const array = [{ name: "John", age: 25 }, { name: "Jane", age: 30 }];
 * const sorted = orderBy(array, (item) => item.age, "desc");
 * console.log(sorted);
 * // [{ name: "Jane", age: 30 }, { name: "John", age: 25 }]
 * ```
 */
export function orderBy<T>(
  array: T[],
  iteratee: SortingSelector<T>,
  order: SortingDirection = "asc"
): T[] {
  return [...array].sort((a: T, b: T) => {
    if (iteratee(a) > iteratee(b)) return order === "asc" ? 1 : -1;
    if (iteratee(a) < iteratee(b)) return order === "asc" ? -1 : 1;
    return 0;
  });
}

/**
 * Checks if arrays are equal
 * @param array1
 * @param array2
 *
 * @example
 * ```
 * const array1 = [1, 2, 3];
 * const array2 = [1, 2, 3];
 * const array3 = [1, 2, 4];
 * const array4 = [1, 2, 3, 4];
 * areEqual(array1, array2); // true
 * areEqual(array1, array3); // false
 * areEqual(array1, array4); // false
 * ```
 */
export function areEqual<T>(
  array1: ArrayLike<T>,
  array2: ArrayLike<T>
): boolean {
  if (array1 === array2) {
    return true;
  }

  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if arrays are equal by the specified property
 * @param array1
 * @param array2
 * @param selector
 *
 * @example
 * ```
 * const array1 = [{ name: "John", age: 25 }, { name: "Jane", age: 30 }];
 * const array2 = [{ name: "John", age: 25 }, { name: "Jane", age: 30 }];
 * const array3 = [{ name: "John", age: 25 }, { name: "Jane", age: 31 }];
 *
 * areEqualBy(array1, array2, (item) => item.age); // true
 * areEqualBy(array1, array3, (item) => item.age); // false
 * ```
 */
export function areEqualBy<T>(
  array1: ArrayLike<T>,
  array2: ArrayLike<T>,
  selector: ObjectSelector<T>
): boolean {
  if (array1 === array2) {
    return true;
  }

  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (selector(array1[i]) !== selector(array2[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the array starts with the specified target
 * @param array
 * @param target
 *
 * @example
 * ```
 * const array = [1, 2, 3, 4, 5];
 * const target1 = [1, 2];
 * const target2 = [1, 3];
 *
 * startsWith(array, target1); // true
 * startsWith(array, target2); // false
 * ```
 */
export function startsWith<T>(
  array: ArrayLike<T>,
  target: ArrayLike<T>
): boolean {
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

/**
 * Checks if the array ends with the specified target
 * @param array
 * @param target
 *
 * @example
 * ```
 * const array = [1, 2, 3, 4, 5];
 * const target1 = [4, 5];
 * const target2 = [3, 5];
 *
 * endsWith(array, target1); // true
 * endsWith(array, target2); // false
 * ```
 */
export function endsWith<T>(
  array: ArrayLike<T>,
  target: ArrayLike<T>
): boolean {
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

/**
 * Makes an array unique by removing duplicate elements
 * @param array
 *
 * @example
 * ```
 * const array = [1, 2, 3, 3, 4, 5, 5];
 * const unique = uniq(array);
 * console.log(unique);
 * // [1, 2, 3, 4, 5]
 * ```
 */
export function uniq<T>(array: Array<T>): Array<T> {
  if (isEmpty(array)) {
    return array;
  }

  return Array.from(new Set(array));
}

/**
 * Makes an array unique by removing duplicate elements using the specified property
 * @param array
 * @param selector
 * @param selection
 *
 * @example
 * ```
 * const array = [{ name: "John", age: 25 }, { name: "Jane", age: 30 }, { name: "John", age: 30 }];
 * const unique = uniqBy(array, (item) => item.name);
 * console.log(unique);
 * // [{ name: "John", age: 25 }, { name: "Jane", age: 30 }]
 * ```
 */
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

/**
 * Returns the depth of an array
 * @param array
 *
 * @example
 * ```
 * const array = [1, 2, 3, [4, 5, [6, 7]]];
 * const depth = depthOf(array);
 * console.log(depth);
 * // 3
 */
export function depthOf(array: unknown | unknown[]): number {
  return Array.isArray(array) ? 1 + Math.max(0, ...array.map(depthOf)) : 0;
}
