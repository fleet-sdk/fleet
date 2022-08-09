export type HexString = string;
export type ErgoTree = string;
export type ErgoAddress = string;
export type Amount = string | bigint;

export type SortingSelector<T> = (item: T) => unknown;
export type SortingDirection = "asc" | "desc";
