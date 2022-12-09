import { Amount, TokenAmount, TokenId } from "@fleet-sdk/common";
import { ensureBigInt } from "@fleet-sdk/common";
import { NotFoundError } from "../../errors";
import { InsufficientTokenAmount } from "../../errors/insufficientTokenAmount";
import { MaxTokensOverflow } from "../../errors/maxTokensOverflow";
import { Collection } from "./collection";

export const MAX_TOKENS_PER_BOX = 120;

export type AddTokenOptions = { sum: boolean };

export class TokensCollection extends Collection<TokenAmount<bigint>> {
  constructor();
  constructor(token: TokenAmount<Amount>);
  constructor(tokens: TokenAmount<Amount>[]);
  constructor(tokens: TokenAmount<Amount>[], options: AddTokenOptions);
  constructor(tokens?: TokenAmount<Amount> | TokenAmount<Amount>[], options?: AddTokenOptions) {
    super();

    if (tokens) {
      this.add(tokens, options);
    }
  }

  private _add(tokenId: TokenId, amount: Amount, sum: boolean): void {
    if (sum) {
      for (const token of this._items) {
        if (token.tokenId === tokenId) {
          token.amount += ensureBigInt(amount);

          return;
        }
      }
    }

    if (this._items.length >= MAX_TOKENS_PER_BOX) {
      throw new MaxTokensOverflow();
    }

    this._items.push({ tokenId, amount: ensureBigInt(amount) });
  }

  public add(tokens: TokenAmount<Amount>[], sum?: AddTokenOptions): TokensCollection;
  public add(token: TokenAmount<Amount>, sum?: AddTokenOptions): TokensCollection;
  public add(
    tokenOrTokens: TokenAmount<Amount> | TokenAmount<Amount>[],
    options?: AddTokenOptions
  ): TokensCollection;
  public add(
    tokenOrTokens: TokenAmount<Amount> | TokenAmount<Amount>[],
    options?: AddTokenOptions
  ): TokensCollection {
    const sum = options ? options.sum : true;

    if (!Array.isArray(tokenOrTokens)) {
      this._add(tokenOrTokens.tokenId, tokenOrTokens.amount, sum);

      return this;
    }

    for (const token of tokenOrTokens) {
      this._add(token.tokenId, token.amount, sum);
    }

    return this;
  }

  public remove(tokenId: TokenId, amount?: Amount): TokensCollection;
  public remove(index: number, amount?: Amount): TokensCollection;
  public remove(tokenIdOrIndex: TokenId | number, amount?: Amount): TokensCollection {
    let index = -1;
    if (typeof tokenIdOrIndex === "number") {
      if (this._isIndexOutOfBounds(tokenIdOrIndex)) {
        throw new RangeError(`Index '${tokenIdOrIndex}' is out of range.`);
      }

      index = tokenIdOrIndex;
    } else {
      index = this._items.findIndex((token) => token.tokenId === tokenIdOrIndex);

      if (this._isIndexOutOfBounds(index)) {
        throw new NotFoundError(`TokenId '${tokenIdOrIndex}' not found in assets collection.`);
      }
    }

    if (amount && index > -1) {
      const bigAmount = ensureBigInt(amount);
      const token = this._items[index];

      if (bigAmount > token.amount) {
        throw new InsufficientTokenAmount(
          `Insufficient token amount to perform a subtraction operation.`
        );
      } else if (bigAmount < token.amount) {
        token.amount -= bigAmount;

        return this;
      }
    }

    if (index > -1) {
      this._items.splice(index, 1);
    }

    return this;
  }

  contains(tokenId: string): boolean {
    return this._items.some((x) => x.tokenId === tokenId);
  }
}
