export function isEmpty<T extends object>(obj?: T): obj is undefined;
export function isEmpty<T>(array?: T[]): array is undefined;
export function isEmpty<T>(obj?: T[] | object): obj is undefined {
  if (!obj) {
    return true;
  }

  return Array.isArray(obj) ? obj.length === 0 : Object.keys(obj).length === 0;
}

export function some<T extends object>(obj?: T): obj is undefined;
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
