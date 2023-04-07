import {
  _0n,
  Amount,
  Base58String,
  Box,
  BoxCandidate,
  ErgoTree,
  isDefined,
  NewToken,
  NonMandatoryRegisters,
  OneOrMore,
  TokenAmount,
  UnsignedInput
} from "@fleet-sdk/common";
import {
  areRegistersDenselyPacked,
  ensureBigInt,
  first,
  isEmpty,
  isHex,
  isUndefined,
  removeUndefined
} from "@fleet-sdk/common";
import { stringToBytes } from "@scure/base";
import { InvalidRegistersPacking } from "../errors/invalidRegistersPacking";
import { UndefinedCreationHeight } from "../errors/undefinedCreationHeight";
import { UndefinedMintingContext } from "../errors/undefinedMintingContext";
import { ErgoAddress } from "../models";
import { TokenAddOptions, TokensCollection } from "../models/collections/tokensCollection";
import { estimateBoxSize } from "../serializer/sigma/boxSerializer";
import { SConstant } from "../serializer/sigma/constantSerializer";
import { SByte, SColl } from "../serializer/sigma/sigmaTypes";

export const BOX_VALUE_PER_BYTE = BigInt(360);
export const SAFE_MIN_BOX_VALUE = BigInt(1000000);

export type BoxValueEstimationCallback = (outputBuilder: OutputBuilder) => bigint;

export function estimateMinBoxValue(valuePerByte = BOX_VALUE_PER_BYTE): BoxValueEstimationCallback {
  return (output: OutputBuilder) => {
    return BigInt(estimateBoxSize(output, SAFE_MIN_BOX_VALUE)) * valuePerByte;
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
    recipient: Base58String | ErgoTree | ErgoAddress,
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

  public get ergoTree(): ErgoTree {
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

  public setAdditionalRegisters(registers: NonMandatoryRegisters): OutputBuilder {
    this._registers = removeUndefined(registers);

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
          R4: SConstant(SColl(SByte, stringToBytes("utf8", this.minting.name || ""))),
          R5: SConstant(SColl(SByte, stringToBytes("utf8", this.minting.description || ""))),
          R6: SConstant(
            SColl(SByte, stringToBytes("utf8", this.minting.decimals?.toString() || "0"))
          )
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
}
