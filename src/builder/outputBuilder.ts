import { DistinctTokensOverflow } from "../errors/distinctTokensOverflow";
import { InsufficientTokenAmount } from "../errors/insufficientTokenAmount";
import { InvalidRegistersPacking } from "../errors/invalidRegistersPacking";
import { Address } from "../models";
import { ByteColl } from "../serialization/sigma/byteColl";
import {
  Amount,
  Base58String,
  Box,
  BoxCandidate,
  ErgoTree,
  NewToken,
  NonMandatoryRegisters,
  TokenAmount,
  TokenId,
  UnsignedInput
} from "../types";
import { first, isEmpty } from "../utils/arrayUtils";
import { toBigInt } from "../utils/bigIntUtils";
import { areRegistersDenselyPacked } from "../utils/boxUtils";
import { removeUndefined } from "../utils/objectUtils";
import { isHex } from "../utils/stringUtils";

export const SAFE_MIN_BOX_VALUE = 1000000n;
export const MAX_DISTINCT_TOKENS_PER_BOX = 120;

export class OutputBuilder {
  private readonly _value: bigint;
  private readonly _address: Address;
  private readonly _height: number;
  private readonly _tokens: TokenAmount<bigint>[];
  private _registers: NonMandatoryRegisters;
  private _minting?: NewToken<bigint>;

  constructor(value: Amount, recipient: Base58String | ErgoTree, creationHeight: number) {
    this._value = toBigInt(value);
    this._address = isHex(recipient)
      ? Address.fromErgoTree(recipient)
      : Address.fromBase58(recipient);
    this._height = creationHeight;

    this._tokens = [];
    this._registers = {};
  }

  public get value(): bigint {
    return this._value;
  }

  public get address(): Base58String {
    return this._address.toString();
  }

  public get ergoTree(): ErgoTree {
    return this._address.ergoTree;
  }

  public get height(): number {
    return this._height;
  }

  public get tokens(): ReadonlyArray<TokenAmount<bigint>> {
    return Object.freeze([...this._tokens]);
  }

  public get additionalRegisters(): NonMandatoryRegisters {
    return this._registers;
  }

  public get minting(): NewToken<bigint> | undefined {
    return this._minting;
  }

  public addToken(tokenId: TokenId, amount: Amount): OutputBuilder {
    for (const token of this._tokens) {
      if (token.tokenId === tokenId) {
        token.amount += toBigInt(amount);

        return this;
      }
    }

    if (this._tokens.length >= MAX_DISTINCT_TOKENS_PER_BOX) {
      throw new DistinctTokensOverflow();
    }

    this._tokens.push({ tokenId, amount: toBigInt(amount) });

    return this;
  }

  public addTokens(tokens: TokenAmount<Amount>[]) {
    for (const token of tokens) {
      this.addToken(token.tokenId, token.amount);
    }

    return this;
  }

  public removeToken(tokenId: TokenId, amount?: Amount) {
    for (let i = 0; i < this._tokens.length; i++) {
      if (this._tokens[i].tokenId === tokenId) {
        if (amount) {
          const bigAmount = toBigInt(amount);
          const token = this._tokens[i];

          if (bigAmount > token.amount) {
            throw new InsufficientTokenAmount(
              `Insufficient token amount to perform this subtraction operation.`
            );
          } else if (bigAmount < token.amount) {
            token.amount -= bigAmount;

            return this;
          }
        }

        this._tokens.splice(i, 1);

        return this;
      }
    }

    return this;
  }

  public mintToken(token: NewToken<Amount>): OutputBuilder {
    this._minting = { ...token, amount: toBigInt(token.amount) };

    return this;
  }

  public setAdditionalRegisters(registers: NonMandatoryRegisters): OutputBuilder {
    this._registers = removeUndefined(registers);

    if (!areRegistersDenselyPacked(registers)) {
      throw new InvalidRegistersPacking();
    }

    return this;
  }

  public build(transactionInputs?: UnsignedInput[] | Box<Amount>[]): BoxCandidate<string> {
    let tokens = this._tokens;

    if (this.minting) {
      if (isEmpty(transactionInputs)) {
        throw Error(
          "Minting context is undefined. Transaction's inputs must be included in order to determine minting token id."
        );
      }

      if (isEmpty(this.additionalRegisters)) {
        this.setAdditionalRegisters({
          R4: new ByteColl(Buffer.from(this.minting.name || "", "utf-8")).toString(),
          R5: new ByteColl(Buffer.from(this.minting.description || "", "utf-8")).toString(),
          R6: new ByteColl(
            Buffer.from(this.minting.decimals?.toString() || "0", "utf-8")
          ).toString()
        });
      }

      tokens = [
        {
          tokenId: first<UnsignedInput | Box<Amount>>(transactionInputs).boxId,
          amount: this.minting.amount
        },
        ...tokens
      ];
    }

    return {
      value: this.value.toString(),
      ergoTree: this.ergoTree,
      creationHeight: this.height,
      assets: tokens.map((token) => {
        return {
          tokenId: token.tokenId,
          amount: token.amount.toString()
        };
      }),
      additionalRegisters: this.additionalRegisters
    };
  }
}
