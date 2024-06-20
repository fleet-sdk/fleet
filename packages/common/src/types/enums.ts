export type EnumConst<T extends object> = T[keyof T];

export enum Network {
  Mainnet = 0x00,
  Testnet = 0x10
}

export enum AddressType {
  P2PK = 1,
  P2SH = 2,
  P2S = 3,
  ADH = 4
}

export const ergoTreeHeaderFlags = {
  sizeInclusion: 0x08,
  constantSegregation: 0x10
} as const;

export type ErgoTreeHeaderFlag = EnumConst<typeof ergoTreeHeaderFlags>;
