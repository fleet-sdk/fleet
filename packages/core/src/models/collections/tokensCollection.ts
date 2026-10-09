import {
  type Amount,
  Collection,
  type CollectionAddOptions,
  FleetError,
  type NewToken,
  type OneOrMore,
  type TokenAmount,
  type TokenId,
  isDefined,
  isUndefined
} from "@fleet-sdk/common";
import { ensureBigInt } from "@fleet-sdk/common";
import { NotFoundError, UndefinedMintingContext } from "../../errors";
import { InsufficientTokenAmount } from "../../errors/insufficientTokenAmount";
import { MaxTokensOverflow } from "../../errors/maxTokensOverflow";

export const MAX_TOKENS_PER_BOX = 100;

export type TokenAddOptions = CollectionAddOptions & { sum?: boolean };
export type OutputToken<T extends Amount = Amount> = {
  tokenId?: TokenId;
  amount: T;
};

type MintingData = { item: OutputToken<bigint>; metadata: NewToken<Amount> };

export class TokensCollection extends Collection<OutputToken<bigint>, OutputToken> {
  #minting: MintingData | undefined;

  constructor();
  constructor(token: TokenAmount<Amount>);
  constructor(tokens: TokenAmount<Amount>[]);
  constructor(tokens: TokenAmount<Amount>[], options: TokenAddOptions);
  constructor(tokens?: OneOrMore<TokenAmount<Amount>>, options?: TokenAddOptions) {
    super();
    if (isDefined(tokens)) this.add(tokens, options);
  }

  public get minting(): NewToken<bigint> | undefined {
    if (!this.#minting || !this._items.includes(this.#minting.item)) return undefined;
    return {
      ...this.#minting.metadata,
      amount: this.#minting.item.amount
    };
  }

  protected override _map(token: OutputToken): OutputToken<bigint> {
    return { tokenId: token.tokenId, amount: ensureBigInt(token.amount) };
  }

  protected override _addOne(token: OutputToken, options?: TokenAddOptions): number {
    if (isUndefined(options) || (options.sum && isUndefined(options.index))) {
      if (this._sum(this._map(token))) return this.length;
    }

    if (this._items.length >= MAX_TOKENS_PER_BOX) throw new MaxTokensOverflow();
    super._addOne(token, options);

    return this.length;
  }

  public override add(items: OneOrMore<TokenAmount<Amount>>, options?: TokenAddOptions): number {
    if (Array.isArray(items)) {
      if (items.some((x) => !x.tokenId)) throw new FleetError("TokenID is required.");
    } else if (!items.tokenId) {
      throw new FleetError("TokenID is required.");
    }

    return super.add(items, options);
  }

  public mint(token: NewToken<Amount>): number {
    if (isDefined(this.minting)) {
      throw new FleetError("Only one minting token is allowed per transaction.");
    }

    const previousLength = this.length;
    const len = super.add({ tokenId: token.tokenId, amount: token.amount });
    // If the amount was summed into an existing item, the minting item is that
    // item; otherwise it is the newly appended one. Track the item itself, not
    // its index, so later insertions and removals cannot detach the minting
    // metadata from the token it belongs to.
    const item =
      len > previousLength
        ? this._items[len - 1]
        : (this._items.find((x) => x.tokenId === token.tokenId) ?? this._items[len - 1]);
    this.#minting = { item, metadata: token };
    return this.length;
  }

  private _sum(token: OutputToken<bigint>): boolean {
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
          "Insufficient token amount to perform a subtraction operation."
        );
      }

      if (bigAmount < token.amount) {
        token.amount -= bigAmount;
        return this.length;
      }
    }

    this._items.splice(index, 1);
    return this.length;
  }

  contains(tokenId: string): boolean {
    return this._items.some((x) => x.tokenId === tokenId);
  }

  toArray(): TokenAmount<bigint>[];
  toArray(mintingTokenId: string): TokenAmount<bigint>[];
  toArray(mintingTokenId?: string): TokenAmount<bigint>[];
  toArray(mintingTokenId?: string): OutputToken[] {
    if (this.minting) {
      if (!mintingTokenId) throw new UndefinedMintingContext();

      return this._items.map((x) => ({
        tokenId: x.tokenId ? x.tokenId : mintingTokenId,
        amount: x.amount
      }));
    }

    return super.toArray();
  }
}
