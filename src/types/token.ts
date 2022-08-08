export type TokenId = string;

type TokenBase<AmountType> = {
  amount: AmountType;
  name?: string;
  decimals?: number;
};

export type TokenAmount<AmountType> = TokenBase<AmountType> & {
  tokenId: TokenId;
};

export type NewToken<AmountType> = TokenBase<AmountType> & {
  tokenId?: TokenId;
  description: string;
};
