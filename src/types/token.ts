export type TokenId = string;

type TokenBase<AmountType> = {
  amount: AmountType;
  [x: string | number | symbol]: unknown;
};

export type TokenAmount<AmountType> = TokenBase<AmountType> & {
  tokenId: TokenId;
};

export type NewToken<AmountType> = TokenBase<AmountType> & {
  tokenId?: TokenId;
  name?: string;
  decimals?: number;
  description?: string;
};
