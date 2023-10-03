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
  first,
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
import { estimateBoxSize, SByte, SColl } from "@fleet-sdk/serializer";
import { InvalidRegistersPacking } from "../errors/invalidRegistersPacking";
import { UndefinedCreationHeight } from "../errors/undefinedCreationHeight";
import { UndefinedMintingContext } from "../errors/undefinedMintingContext";
import {
  AdditionalRegisters,
  ErgoAddress,
  ErgoTree,
  RegisterInput,
  SequentialNonMandatoryRegisters
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

  public addNfts(...tokenIds: TokenId[]): OutputBuilder {
    const tokens = tokenIds.map((tokenId) => ({ tokenId, amount: _1n }));

    return this.addTokens(tokens);
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

  public setAdditionalRegisters<T extends AdditionalRegisters>(
    registers: SequentialNonMandatoryRegisters<T>
  ): OutputBuilder {
    const hexRegisters: NonMandatoryRegisters = {};
    for (const key in registers) {
      const r = registers[key] as RegisterInput;
      if (!r) continue;

      hexRegisters[key as keyof NonMandatoryRegisters] = typeof r === "string" ? r : r.toHex();
    }

    if (!areRegistersDenselyPacked(hexRegisters)) throw new InvalidRegistersPacking();
    this._registers = hexRegisters;

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
          R4: SColl(SByte, utf8.decode(this.minting.name || "")),
          R5: SColl(SByte, utf8.decode(this.minting.description || "")),
          R6: SColl(SByte, utf8.decode(this.minting.decimals?.toString() || "0"))
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
    if (this.minting) {
      tokens.push({
        tokenId: "0000000000000000000000000000000000000000000000000000000000000000",
        amount: this.minting.amount
      });
    }

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
