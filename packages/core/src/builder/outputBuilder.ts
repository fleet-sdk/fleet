import {
  assert,
  type Amount,
  type Box,
  type BoxCandidate,
  type ErgoTreeHex,
  type HexString,
  type NewToken,
  type NonMandatoryRegisters,
  type OneOrMore,
  type TokenAmount,
  type TokenId,
  type UnsignedInput,
  _0n,
  _1n,
  areRegistersDenselyPacked,
  ensureBigInt,
  isDefined,
  isEmpty,
  isHex,
  isUndefined
} from "@fleet-sdk/common";
import { utf8 } from "@fleet-sdk/crypto";
import { SByte, SColl, type SConstant, estimateBoxSize } from "@fleet-sdk/serializer";
import { InvalidRegistersPacking, UndefinedCreationHeight } from "../errors";
import { ErgoAddress, type ErgoBox, ErgoTree, type ErgoUnsignedInput } from "../models";
import { type TokenAddOptions, TokensCollection } from "../models/collections/tokensCollection";
import { ErgoBoxCandidate } from "../models/ergoBoxCandidate";

export const BOX_VALUE_PER_BYTE = BigInt(360);
export const SAFE_MIN_BOX_VALUE = BigInt(1000000);

export type BoxValueEstimationCallback = (outputBuilder: OutputBuilder) => bigint;
export type TransactionOutputFlags = { change: boolean };

export function estimateMinBoxValue(valuePerByte = BOX_VALUE_PER_BYTE): BoxValueEstimationCallback {
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
  #flags: TransactionOutputFlags = { change: false };

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

  get flags(): TransactionOutputFlags {
    return this.#flags;
  }

  static from(box: Box<Amount> | ErgoBoxCandidate | ErgoBox | ErgoUnsignedInput) {
    return new OutputBuilder(box.value, box.ergoTree)
      .addTokens(box.assets)
      .setAdditionalRegisters(box.additionalRegisters);
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

  setFlags(flags: Partial<TransactionOutputFlags>): OutputBuilder {
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

  setAdditionalRegisters(registers: NonMandatoryRegisters<ConstantInput>): OutputBuilder {
    for (const key in registers) {
      const r = registers[key as keyof NonMandatoryRegisters];
      if (!r) continue;

      this.#registers[key as keyof NonMandatoryRegisters] = typeof r === "string" ? r : r.toHex();
    }

    return this;
  }

  eject(ejector: (context: { tokens: TokensCollection }) => void): OutputBuilder {
    ejector({ tokens: this.#tokens });
    return this;
  }

  build(transactionInputs?: UnsignedInput[] | Box<Amount>[]): ErgoBoxCandidate {
    if (!areRegistersDenselyPacked(this.#registers)) throw new InvalidRegistersPacking();

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
      tokens = this.assets.toArray().filter((x) => x.amount > _0n);
    }

    if (isUndefined(this.creationHeight)) throw new UndefinedCreationHeight();

    return new ErgoBoxCandidate(
      {
        value: this.value,
        ergoTree: this.ergoTree,
        creationHeight: this.creationHeight,
        assets: tokens,
        additionalRegisters: this.additionalRegisters
      },
      this.#flags
    );
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
