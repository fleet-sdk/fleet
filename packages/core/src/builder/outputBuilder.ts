import {
  _0n,
  Amount,
  areRegistersDenselyPacked,
  assert,
  Box,
  BoxCandidate,
  clearUndefined,
  ensureBigInt,
  ErgoTreeHex,
  first,
  HexString,
  isDefined,
  isEmpty,
  isHex,
  isUndefined,
  NewToken,
  NonMandatoryRegisters,
  OneOrMore,
  TokenAmount,
  UnsignedInput
} from "@fleet-sdk/common";
import { utf8 } from "@fleet-sdk/crypto";
import { estimateBoxSize, SByte, SColl } from "@fleet-sdk/serializer";
import { SConstant } from "../constantSerializer";
import { InvalidRegistersPacking } from "../errors/invalidRegistersPacking";
import { UndefinedCreationHeight } from "../errors/undefinedCreationHeight";
import { UndefinedMintingContext } from "../errors/undefinedMintingContext";
import {
  ErgoAddress,
  ErgoTree,
  OnlyR4Register,
  R4ToR5Registers,
  R4ToR6Registers,
  R4ToR7Registers,
  R4ToR8Registers,
  R4ToR9Registers
} from "../models";
import { TokenAddOptions, TokensCollection } from "../models/collections/tokensCollection";

export const BOX_VALUE_PER_BYTE = BigInt(360);
export const SAFE_MIN_BOX_VALUE = BigInt(1000000);

export type BoxValueEstimationCallback = (outputBuilder: OutputBuilder) => bigint;

export function estimateMinBoxValue(valuePerByte = BOX_VALUE_PER_BYTE): BoxValueEstimationCallback {
  return (output) => {
    return BigInt(output.estimateSize()) * valuePerByte;
  };
}

export class OutputBuilder {
  private readonly _address: ErgoAddress;
  private readonly _tokens: TokensCollection;
  private _value!: bigint;
  private _valueEstimator?: BoxValueEstimationCallback;
  private _creationHeight?: number;
  private _registers: NonMandatoryRegisters;
  private _minting?: NewToken<bigint>;

  constructor(
    value: Amount | BoxValueEstimationCallback,
    recipient: ErgoAddress | ErgoTree | string,
    creationHeight?: number
  ) {
    this.setValue(value);

    this._creationHeight = creationHeight;
    this._tokens = new TokensCollection();
    this._registers = {};

    if (typeof recipient === "string") {
      this._address = isHex(recipient)
        ? ErgoAddress.fromErgoTree(recipient)
        : ErgoAddress.fromBase58(recipient);
    } else if (recipient instanceof ErgoTree) {
      this._address = recipient.toAddress();
    } else {
      this._address = recipient;
    }
  }

  public get value(): bigint {
    return isDefined(this._valueEstimator) ? this._valueEstimator(this) : this._value;
  }

  public get address(): ErgoAddress {
    return this._address;
  }

  public get ergoTree(): ErgoTreeHex {
    return this._address.ergoTree;
  }

  public get creationHeight(): number | undefined {
    return this._creationHeight;
  }

  public get assets(): TokensCollection {
    return this._tokens;
  }

  public get additionalRegisters(): NonMandatoryRegisters {
    return this._registers;
  }

  public get minting(): NewToken<bigint> | undefined {
    return this._minting;
  }

  public setValue(value: Amount | BoxValueEstimationCallback): OutputBuilder {
    if (typeof value === "function") {
      this._valueEstimator = value;
    } else {
      this._value = ensureBigInt(value);
      this._valueEstimator = undefined;

      if (this._value <= _0n) {
        throw new Error("An UTxO cannot be created without a minimum required amount.");
      }
    }

    return this;
  }

  public addTokens(
    tokens: OneOrMore<TokenAmount<Amount>> | TokensCollection,
    options?: TokenAddOptions
  ): OutputBuilder {
    if (tokens instanceof TokensCollection) {
      this._tokens.add(tokens.toArray(), options);
    } else {
      this._tokens.add(tokens, options);
    }

    return this;
  }

  public mintToken(token: NewToken<Amount>): OutputBuilder {
    this._minting = { ...token, amount: ensureBigInt(token.amount) };

    return this;
  }

  public setCreationHeight(height: number, options?: { replace: boolean }): OutputBuilder {
    if (
      isUndefined(options) ||
      options.replace === true ||
      (options.replace === false && isUndefined(this._creationHeight))
    ) {
      this._creationHeight = height;
    }

    return this;
  }

  public setAdditionalRegisters<T extends NonMandatoryRegisters>(
    registers: SequentialNonMandatoryRegisters<T>
  ): OutputBuilder {
    this._registers = clearUndefined(registers);

    if (!areRegistersDenselyPacked(registers)) {
      throw new InvalidRegistersPacking();
    }

    return this;
  }

  public eject(ejector: (context: { tokens: TokensCollection }) => void): OutputBuilder {
    ejector({ tokens: this._tokens });

    return this;
  }

  public build(transactionInputs?: UnsignedInput[] | Box<Amount>[]): BoxCandidate<bigint> {
    let tokens = this.assets.toArray();

    if (this.minting) {
      if (isEmpty(transactionInputs)) {
        throw new UndefinedMintingContext();
      }

      if (isEmpty(this.additionalRegisters)) {
        this.setAdditionalRegisters({
          R4: SConstant(SColl(SByte, utf8.decode(this.minting.name || ""))),
          R5: SConstant(SColl(SByte, utf8.decode(this.minting.description || ""))),
          R6: SConstant(SColl(SByte, utf8.decode(this.minting.decimals?.toString() || "0")))
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

    if (isUndefined(this.creationHeight)) {
      throw new UndefinedCreationHeight();
    }

    return {
      value: this.value,
      ergoTree: this.ergoTree,
      creationHeight: this.creationHeight,
      assets: tokens.map((token) => ({
        tokenId: token.tokenId,
        amount: token.amount
      })),
      additionalRegisters: this.additionalRegisters
    };
  }

  estimateSize(value = SAFE_MIN_BOX_VALUE): number {
    assert(!!this.creationHeight, "Creation height must be set");

    const tokens = this._tokens.toArray();
    const plainBoxObject: BoxCandidate<bigint> = {
      value,
      ergoTree: this.ergoTree,
      creationHeight: this.creationHeight,
      assets: tokens.map((token) => ({
        tokenId: token.tokenId,
        amount: token.amount
      })),
      additionalRegisters: this.additionalRegisters
    };

    return estimateBoxSize(plainBoxObject);
  }
}

export type SequentialNonMandatoryRegisters<T extends NonMandatoryRegisters> = T extends {
  R9: HexString;
}
  ? R4ToR9Registers
  : T extends { R8: HexString }
  ? R4ToR8Registers
  : T extends { R7: HexString }
  ? R4ToR7Registers
  : T extends { R6: HexString }
  ? R4ToR6Registers
  : T extends { R5: HexString }
  ? R4ToR5Registers
  : T extends { R4: HexString }
  ? OnlyR4Register
  : T;
