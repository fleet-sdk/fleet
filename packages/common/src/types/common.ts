export type HexString = string;
export type ErgoTreeHex = string;
export type Base58String = string;
export type Amount = string | bigint;

export type OneOrMore<T> = T | T[];

export type SortingSelector<T> = (item: T) => string | number | bigint;
export type SortingDirection = "asc" | "desc";

export type FilterPredicate<T> = (item: T) => boolean;

export type BuildOutputType = "default" | "EIP-12";

export enum Network {
  Mainnet = 0x00,
  Testnet = 0x10
}

export enum AddressType {
  P2PK = 1,
  P2SH = 2,
  P2S = 3
}

export const ergoTreeHeaderFlags = {
  sizeInclusion: 0x08,
  constantSegregation: 0x10
} as const;

export type ErgoTreeHeaderFlag = (typeof ergoTreeHeaderFlags)[keyof typeof ergoTreeHeaderFlags];
