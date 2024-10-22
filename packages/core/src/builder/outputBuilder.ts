import {
  _0n,
  _1n,
  type Amount,
  areRegistersDenselyPacked,
  assert,
  type Box,
  type BoxCandidate,
  ensureBigInt,
  type ErgoTreeHex,
  type HexString,
  isDefined,
  isEmpty,
  isHex,
  isUndefined,
  type NewToken,
  type NonMandatoryRegisters,
  type OneOrMore,
  type TokenAmount,
  type TokenId,
  type UnsignedInput
} from "@fleet-sdk/common";
import { utf8 } from "@fleet-sdk/crypto";
import { estimateBoxSize, SByte, SColl, type SConstant } from "@fleet-sdk/serializer";
import { InvalidRegistersPacking, UndefinedCreationHeight } from "../errors";
import { ErgoAddress, ErgoTree } from "../models";
import {
  type TokenAddOptions,
  TokensCollection
} from "../models/collections/tokensCollection";

export const BOX_VALUE_PER_BYTE = BigInt(360);
export const SAFE_MIN_BOX_VALUE = BigInt(1000000);

export type BoxValueEstimationCallback = (outputBuilder: OutputBuilder) => bigint;
export type OutputBuilderFlags = { change: boolean };

export function estimateMinBoxValue(
  valuePerByte = BOX_VALUE_PER_BYTE
): BoxValueEstimationCallback {
  return (output) => {
    return BigInt(output.estimateSize()) * valuePerByte;
  };
}

const DUMB_TOKEN_ID = "0000000000000000000000000000000000000000000000000000000000000000";

export class OutputBuilder {
  readonly #address: ErgoAddress;
  readonly #tokens: TokensCollection;
  #value!: bigint;
  #valueEstimator?: BoxValueEstimationCallback;
  #creationHeight?: number;
  #registers: NonMandatoryRegisters;
  #flags: OutputBuilderFlags = { change: false };

  constructor(
    value: Amount | BoxValueEstimationCallback,
    recipient: ErgoAddress | ErgoTree | string,
    creationHeight?: number
  ) {
    this.setValue(value);

    this.#creationHeight = creationHeight;
    this.#tokens = new TokensCollection();
    this.#registers = {};
    this.#flags = { change: false };

    if (typeof recipient === "string") {
      this.#address = isHex(recipient)
        ? ErgoAddress.fromErgoTree(recipient)
        : ErgoAddress.fromBase58(recipient);
    } else if (recipient instanceof ErgoTree) {
      this.#address = recipient.toAddress();
    } else {
      this.#address = recipient;
    }
  }

  get value(): bigint {
    return isDefined(this.#valueEstimator) ? this.#valueEstimator(this) : this.#value;
  }

  get address(): ErgoAddress {
    return this.#address;
  }

  get ergoTree(): ErgoTreeHex {
    return this.#address.ergoTree;
  }

  get creationHeight(): number | undefined {
    return this.#creationHeight;
  }

  get assets(): TokensCollection {
    return this.#tokens;
  }

  get additionalRegisters(): NonMandatoryRegisters {
    return this.#registers;
  }

  get minting(): NewToken<bigint> | undefined {
    return this.assets.minting;
  }

  get flags(): OutputBuilderFlags {
    return this.#flags;
  }

  setValue(value: Amount | BoxValueEstimationCallback): OutputBuilder {
    if (typeof value === "function") {
      this.#valueEstimator = value;
    } else {
      this.#value = ensureBigInt(value);
      this.#valueEstimator = undefined;

      if (this.#value <= _0n) {
        throw new Error("An UTxO cannot be created without a minimum required amount.");
      }
    }

    return this;
  }

  setFlags(flags: Partial<OutputBuilderFlags>): OutputBuilder {
    this.#flags = { ...this.#flags, ...flags };
    return this;
  }

  addTokens(
    tokens: OneOrMore<TokenAmount<Amount>> | TokensCollection,
    options?: TokenAddOptions
  ): OutputBuilder {
    if (tokens instanceof TokensCollection) {
      this.#tokens.add(tokens.toArray(), options);
    } else {
      this.#tokens.add(tokens, options);
    }

    return this;
  }

  addNfts(...tokenIds: TokenId[]): OutputBuilder {
    const tokens = tokenIds.map((tokenId) => ({ tokenId, amount: _1n }));
    return this.addTokens(tokens);
  }

  mintToken(token: NewToken<Amount>): OutputBuilder {
    this.assets.mint(token);
    return this;
  }

  setCreationHeight(height: number, options?: { replace: boolean }): OutputBuilder {
    if (
      isUndefined(options) ||
      options.replace === true ||
      (options.replace === false && isUndefined(this.#creationHeight))
    ) {
      this.#creationHeight = height;
    }

    return this;
  }

  setAdditionalRegisters<T extends AdditionalRegistersInput>(
    registers: SequentialNonMandatoryRegisters<T>
  ): OutputBuilder {
    const hexRegisters: NonMandatoryRegisters = {};
    for (const key in registers) {
      const r = registers[key] as ConstantInput;
      if (!r) continue;

      hexRegisters[key as keyof NonMandatoryRegisters] =
        typeof r === "string" ? r : r.toHex();
    }

    if (!areRegistersDenselyPacked(hexRegisters)) throw new InvalidRegistersPacking();
    this.#registers = hexRegisters;

    return this;
  }

  eject(ejector: (context: { tokens: TokensCollection }) => void): OutputBuilder {
    ejector({ tokens: this.#tokens });
    return this;
  }

  build(transactionInputs?: UnsignedInput[] | Box<Amount>[]): BoxCandidate<bigint> {
    let tokens: TokenAmount<bigint>[];

    if (this.minting) {
      const mintingTokenId = transactionInputs ? transactionInputs[0]?.boxId : undefined;
      tokens = this.assets.toArray(mintingTokenId);

      if (isEmpty(this.additionalRegisters)) {
        this.setAdditionalRegisters({
          R4: SColl(SByte, utf8.decode(this.minting.name || "")),
          R5: SColl(SByte, utf8.decode(this.minting.description || "")),
          R6: SColl(SByte, utf8.decode(this.minting.decimals?.toString() || "0"))
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
      assets: this.#tokens.toArray(DUMB_TOKEN_ID),
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

export type SequentialNonMandatoryRegisters<T extends AdditionalRegistersInput> =
  T extends {
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
