export type HexString = string;
export type ErgoTree = string;
export type Base58String = string;
export type Amount = string | bigint;

export type SortingSelector<T> = (item: T) => unknown;
export type SortingDirection = "asc" | "desc";

export type FilterPredicate<T> = (item: T) => boolean;

export enum Network {
  Mainnet = 0 << 4,
  Testnet = 1 << 4
}

export enum AddressType {
  P2PK = 1,
  P2SH = 2,
  P2S = 3
}
