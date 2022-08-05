import { Amount } from "./primitives";

export type TokenId = string;

type TokenBase = {
  amount: Amount;
  name?: string;
  decimals?: number;
};

export type TokenAmount = TokenBase & {
  tokenId: TokenId;
};

export type NewToken = TokenBase & {
  tokenId?: TokenId;
  description: string;
};
