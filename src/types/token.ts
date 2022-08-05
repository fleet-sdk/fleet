import { Amount } from "./primitives";

export type TokenId = string;

export type TokenAmount = {
  tokenId: TokenId;
  amount: Amount;
  name?: string;
  decimals?: number;
};
