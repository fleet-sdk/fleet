import { Amount, isDefined, isUndefined, TokenAmount, TokenId } from "@fleet-sdk/common";
import { ensureBigInt } from "@fleet-sdk/common";
import { NotFoundError } from "../../errors";
import { InsufficientTokenAmount } from "../../errors/insufficientTokenAmount";
import { MaxTokensOverflow } from "../../errors/maxTokensOverflow";
import { Collection, CollectionAddOptions } from "./collection";

export const MAX_TOKENS_PER_BOX = 120;

export type TokenAddOptions = CollectionAddOptions & { sum?: boolean };

export class TokensCollection extends Collection<TokenAmount<bigint>, TokenAmount<Amount>> {
  constructor();
  constructor(token: TokenAmount<Amount>);
  constructor(tokens: TokenAmount<Amount>[]);
  constructor(tokens: TokenAmount<Amount>[], options: TokenAddOptions);
  constructor(tokens?: TokenAmount<Amount> | TokenAmount<Amount>[], options?: TokenAddOptions) {
    super();

    if (isDefined(tokens)) {
      this.add(tokens, options);
    }
  }

  protected override _map(token: TokenAmount<bigint> | TokenAmount<Amount>): TokenAmount<bigint> {
    return { tokenId: token.tokenId, amount: ensureBigInt(token.amount) };
  }

  protected override _addOne(
    token: TokenAmount<bigint> | TokenAmount<Amount>,
    options?: TokenAddOptions
  ): number {
    if (isUndefined(options) || (options.sum && !isDefined(options.index))) {
      if (this._sum(this._map(token))) {
        return this.length;
      }
    }

    if (this._items.length >= MAX_TOKENS_PER_BOX) {
      throw new MaxTokensOverflow();
    }

    super._addOne(token, options);

    return this.length;
  }

  public override add(
    items: TokenAmount<Amount> | TokenAmount<Amount>[],
    options?: TokenAddOptions
  ): number {
    return super.add(items, options);
  }

  private _sum(token: TokenAmount<bigint>): boolean {
    for (const t of this._items) {
      if (t.tokenId === token.tokenId) {
        t.amount += token.amount;

        return true;
      }
    }

    return false;
  }

  public remove(tokenId: TokenId, amount?: Amount): number;
  public remove(index: number, amount?: Amount): number;
  public remove(tokenIdOrIndex: TokenId | number, amount?: Amount): number {
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

        return this.length;
      }
    }

    if (index > -1) {
      this._items.splice(index, 1);
    }

    return this.length;
  }

  contains(tokenId: string): boolean {
    return this._items.some((x) => x.tokenId === tokenId);
  }
}
