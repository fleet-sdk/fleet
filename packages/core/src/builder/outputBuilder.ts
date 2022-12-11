import {
  Amount,
  Base58String,
  Box,
  BoxCandidate,
  ErgoTree,
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
import { SConstant } from "../serialization/sigma/constantSerializer";
import { SByte, SColl } from "../serialization/sigma/sigmaTypes";

export const SAFE_MIN_BOX_VALUE = BigInt(1000000);

export class OutputBuilder {
  private readonly _value: bigint;
  private readonly _address: ErgoAddress;
  private readonly _tokens: TokensCollection;
  private _creationHeight?: number;
  private _registers: NonMandatoryRegisters;
  private _minting?: NewToken<bigint>;

  constructor(
    value: Amount,
    recipient: Base58String | ErgoTree | ErgoAddress,
    creationHeight?: number
  ) {
    this._value = ensureBigInt(value);
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
    return this._value;
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

  public get tokens(): TokensCollection {
    return this._tokens;
  }

  public get additionalRegisters(): NonMandatoryRegisters {
    return this._registers;
  }

  public get minting(): NewToken<bigint> | undefined {
    return this._minting;
  }

  public addTokens(
    tokens: OneOrMore<TokenAmount<Amount>> | TokensCollection,
    options?: TokenAddOptions
  ) {
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

  public build(transactionInputs?: UnsignedInput[] | Box<Amount>[]): BoxCandidate<string> {
    let tokens = this.tokens.toArray();

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
      value: this.value.toString(),
      ergoTree: this.ergoTree,
      creationHeight: this.creationHeight,
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
