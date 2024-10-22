export type HexString = string;
export type ErgoTreeHex = string;
export type Base58String = string;
export type Amount = string | bigint;

export type OneOrMore<T> = T | T[];

export type SortingSelector<T> = (item: T) => string | number | bigint;
export type SortingDirection = "asc" | "desc";

export type FilterPredicate<T> = (item: T) => boolean;

export type PlainObjectType = "minimal" | "EIP-12";
