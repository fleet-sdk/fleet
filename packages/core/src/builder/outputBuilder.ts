import {
  _0n,
  _1n,
  Amount,
  areRegistersDenselyPacked,
  assert,
  Box,
  BoxCandidate,
  ensureBigInt,
  ErgoTreeHex,
  HexString,
  isDefined,
  isEmpty,
  isHex,
  isUndefined,
  NewToken,
  NonMandatoryRegisters,
  OneOrMore,
  TokenAmount,
  TokenId,
  UnsignedInput
} from "@fleet-sdk/common";
import { utf8 } from "@fleet-sdk/crypto";
import {
  estimateBoxSize,
  SByte,
  SColl,
  SConstant
} from "@fleet-sdk/serializer";
import { InvalidRegistersPacking, UndefinedCreationHeight } from "../errors";
import { ErgoAddress, ErgoTree } from "../models";
import {
  TokenAddOptions,
  TokensCollection
} from "../models/collections/tokensCollection";

export const BOX_VALUE_PER_BYTE = BigInt(360);
export const SAFE_MIN_BOX_VALUE = BigInt(1000000);

export type BoxValueEstimationCallback = (
  outputBuilder: OutputBuilder
) => bigint;

export function estimateMinBoxValue(
  valuePerByte = BOX_VALUE_PER_BYTE
): BoxValueEstimationCallback {
  return (output) => {
    return BigInt(output.estimateSize()) * valuePerByte;
  };
}

const DUMB_TOKEN_ID =
  "0000000000000000000000000000000000000000000000000000000000000000";

export class OutputBuilder {
  private readonly _address: ErgoAddress;
  private readonly _tokens: TokensCollection;
  private _value!: bigint;
  private _valueEstimator?: BoxValueEstimationCallback;
  private _creationHeight?: number;
  private _registers: NonMandatoryRegisters;

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
    return isDefined(this._valueEstimator)
      ? this._valueEstimator(this)
      : this._value;
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
    return this.assets.minting;
  }

  public setValue(value: Amount | BoxValueEstimationCallback): OutputBuilder {
    if (typeof value === "function") {
      this._valueEstimator = value;
    } else {
      this._value = ensureBigInt(value);
      this._valueEstimator = undefined;

      if (this._value <= _0n) {
        throw new Error(
          "An UTxO cannot be created without a minimum required amount."
        );
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

  public addNfts(...tokenIds: TokenId[]): OutputBuilder {
    const tokens = tokenIds.map((tokenId) => ({ tokenId, amount: _1n }));

    return this.addTokens(tokens);
  }

  public mintToken(token: NewToken<Amount>): OutputBuilder {
    this.assets.mint(token);
    return this;
  }

  public setCreationHeight(
    height: number,
    options?: { replace: boolean }
  ): OutputBuilder {
    if (
      isUndefined(options) ||
      options.replace === true ||
      (options.replace === false && isUndefined(this._creationHeight))
    ) {
      this._creationHeight = height;
    }

    return this;
  }

  public setAdditionalRegisters<T extends AdditionalRegistersInput>(
    registers: SequentialNonMandatoryRegisters<T>
  ): OutputBuilder {
    const hexRegisters: NonMandatoryRegisters = {};
    for (const key in registers) {
      const r = registers[key] as ConstantInput;
      if (!r) continue;

      hexRegisters[key as keyof NonMandatoryRegisters] =
        typeof r === "string" ? r : r.toHex();
    }

    if (!areRegistersDenselyPacked(hexRegisters))
      throw new InvalidRegistersPacking();
    this._registers = hexRegisters;

    return this;
  }

  public eject(
    ejector: (context: { tokens: TokensCollection }) => void
  ): OutputBuilder {
    ejector({ tokens: this._tokens });
    return this;
  }

  public build(
    transactionInputs?: UnsignedInput[] | Box<Amount>[]
  ): BoxCandidate<bigint> {
    let tokens: TokenAmount<bigint>[];

    if (this.minting) {
      const mintingTokenId = transactionInputs
        ? transactionInputs[0]?.boxId
        : undefined;
      tokens = this.assets.toArray(mintingTokenId);

      if (isEmpty(this.additionalRegisters)) {
        this.setAdditionalRegisters({
          R4: SColl(SByte, utf8.decode(this.minting.name || "")),
          R5: SColl(SByte, utf8.decode(this.minting.description || "")),
          R6: SColl(
            SByte,
            utf8.decode(this.minting.decimals?.toString() || "0")
          )
        });
      }
    } else {
      tokens = this.assets.toArray();
    }

    if (isUndefined(this.creationHeight)) throw new UndefinedCreationHeight();

    return {
      value: this.value,
      ergoTree: this.ergoTree,
      creationHeight: this.creationHeight,
      assets: tokens,
      additionalRegisters: this.additionalRegisters
    };
  }

  estimateSize(value = SAFE_MIN_BOX_VALUE): number {
    assert(!!this.creationHeight, "Creation height must be set");

    const plainBoxObject: BoxCandidate<bigint> = {
      value,
      ergoTree: this.ergoTree,
      creationHeight: this.creationHeight,
      assets: this._tokens.toArray(DUMB_TOKEN_ID),
      additionalRegisters: this.additionalRegisters
    };

    return estimateBoxSize(plainBoxObject);
  }
}

export type ConstantInput = SConstant | HexString;

export type AdditionalRegistersInput = NonMandatoryRegisters<ConstantInput>;

export type OnlyR4Register<T = HexString> = {
  R4: T;
} & NonMandatoryRegisters<T>;

export type R4ToR5Registers<T = HexString> = {
  R4: T;
  R5: T;
} & NonMandatoryRegisters<T>;

export type R4ToR6Registers<T = HexString> = {
  R4: T;
  R5: T;
  R6: T;
} & NonMandatoryRegisters<T>;

export type R4ToR7Registers<T = HexString> = {
  R4: T;
  R5: T;
  R6: T;
  R7: T;
} & NonMandatoryRegisters<T>;

export type R4ToR8Registers<T = HexString> = {
  R4: T;
  R5: T;
  R6: T;
  R7: T;
  R8: T;
} & NonMandatoryRegisters<T>;

export type R4ToR9Registers<T = HexString> = {
  R4: T;
  R5: T;
  R6: T;
  R7: T;
  R8: T;
  R9: T;
} & NonMandatoryRegisters<T>;

export type SequentialNonMandatoryRegisters<
  T extends AdditionalRegistersInput
> = T extends {
  R9: ConstantInput;
}
  ? R4ToR9Registers<ConstantInput>
  : T extends { R8: ConstantInput }
    ? R4ToR8Registers<ConstantInput>
    : T extends { R7: ConstantInput }
      ? R4ToR7Registers<ConstantInput>
      : T extends { R6: ConstantInput }
        ? R4ToR6Registers<ConstantInput>
        : T extends { R5: ConstantInput }
          ? R4ToR5Registers<ConstantInput>
          : T extends { R4: ConstantInput }
            ? OnlyR4Register<ConstantInput>
            : T;
