import { InsufficientTokenAmount } from "../../errors/insufficientTokenAmount";
import { MaxTokensOverflow } from "../../errors/maxTokensOverflow";
import { Amount, TokenAmount, TokenId } from "../../types";
import { toBigInt } from "../../utils/bigIntUtils";
import { Collection } from "./collection";

export const MAX_TOKENS_PER_BOX = 120;

export type AddTokenOptions = { sum: boolean };

export class TokensCollection extends Collection<TokenAmount<bigint>> {
  constructor() {
    super();
  }

  private _add(tokenId: TokenId, amount: Amount, sum: boolean): void {
    if (sum) {
      for (const token of this._items) {
        if (token.tokenId === tokenId) {
          token.amount += toBigInt(amount);

          return;
        }
      }
    }

    if (this._items.length >= MAX_TOKENS_PER_BOX) {
      throw new MaxTokensOverflow();
    }

    this._items.push({ tokenId, amount: toBigInt(amount) });
  }

  public add(tokens: TokenAmount<Amount>[], sum?: AddTokenOptions): TokensCollection;
  public add(token: TokenAmount<Amount>, sum?: AddTokenOptions): TokensCollection;
  public add(
    tokenOrTokens: TokenAmount<Amount>[] | TokenAmount<Amount>,
    options?: AddTokenOptions
  ): TokensCollection;
  public add(
    tokenOrTokens: TokenAmount<Amount>[] | TokenAmount<Amount>,
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
    for (let i = 0; i < this._items.length; i++) {
      if (this._items[i].tokenId !== tokenIdOrIndex) {
        continue;
      }

      if (amount) {
        const bigAmount = toBigInt(amount);
        const token = this._items[i];

        if (bigAmount > token.amount) {
          throw new InsufficientTokenAmount(
            `Insufficient token amount to perform a subtraction operation.`
          );
        } else if (bigAmount < token.amount) {
          token.amount -= bigAmount;

          return this;
        }
      }

      this._items.splice(i, 1);

      return this;
    }

    return this;
  }
}
