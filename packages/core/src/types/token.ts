export type TokenId = string;

type TokenBase<AmountType> = {
  amount: AmountType;
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

export type TokenTargetAmount<AmountType> = {
  tokenId: TokenId;
  amount?: AmountType;
};
