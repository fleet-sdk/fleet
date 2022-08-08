import {
  Amount,
  ErgoAddress,
  ErgoTree,
  NewToken,
  NonMandatoryRegisters,
  TokenId,
  BoxCandidate,
  TokenAmount,
  UnsignedInput
} from "../types";
import { toBigInt } from "../utils/bigIntUtils";

export class OutputBuilder {
  private readonly _value: bigint;
  private readonly _recipient: ErgoAddress | ErgoTree;
  private readonly _height: number;
  private readonly _tokens: TokenAmount<bigint>[];
  private _registers: NonMandatoryRegisters;
  private _minting?: NewToken<bigint>;

  constructor(value: Amount, recipient: ErgoAddress | ErgoTree, creationHeight: number) {
    this._value = toBigInt(value);
    this._recipient = recipient;
    this._height = creationHeight;
    this._tokens = [];
    this._registers = {};
  }

  public get value(): Amount {
    return this._value;
  }

  public get address(): ErgoAddress {
    throw Error("Not implemented");
  }

  public get ergoTree(): ErgoTree {
    throw Error("Not implemented");
  }

  public get height(): number {
    return this._height;
  }

  public get tokens(): (TokenAmount<bigint> | NewToken<bigint>)[] {
    if (this._minting) {
      return [this._minting, ...this._tokens];
    }

    return this._tokens;
  }

  public get additionalRegisters(): NonMandatoryRegisters {
    return this._registers;
  }

  public get minting(): NewToken<bigint> | undefined {
    return this._minting;
  }

  public addToken(tokenId: TokenId, amount: Amount): OutputBuilder {
    this._tokens.push({ tokenId, amount: toBigInt(amount) });

    return this;
  }

  public mintToken(token: NewToken<Amount>): OutputBuilder {
    this._minting = { ...token, amount: toBigInt(token.amount) };

    return this;
  }

  public setRegisters(registers: NonMandatoryRegisters): OutputBuilder {
    this._registers = registers;

    return this;
  }

  public build(): BoxCandidate;
  public build(mintingContext?: UnsignedInput[] /** todo: replace by selection */): BoxCandidate {
    let tokens = this._tokens;

    if (this.minting) {
      if (!mintingContext || mintingContext.length === 0) {
        throw Error("Minting context is undefined.");
      }

      tokens = [{ tokenId: mintingContext[0].boxId, amount: this.minting.amount }, ...tokens];
    }

    return {
      ergoTree: this.ergoTree,
      value: this.value.toString(),
      assets: tokens,
      creationHeight: this.height,
      additionalRegisters: this.additionalRegisters
    };
  }
}
