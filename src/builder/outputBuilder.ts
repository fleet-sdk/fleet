import { InvalidRegistersPacking } from "../errors/invalidRegistersPacking";
import { ErgoAddress } from "../models";
import { AddTokenOptions, TokensCollection } from "../models/collections/tokensCollection";
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
  UnsignedInput
} from "../types";
import { first, isEmpty } from "../utils/arrayUtils";
import { toBigInt } from "../utils/bigIntUtils";
import { areRegistersDenselyPacked } from "../utils/boxUtils";
import { removeUndefined } from "../utils/objectUtils";
import { isHex } from "../utils/stringUtils";

export const SAFE_MIN_BOX_VALUE = 1000000n;

export class OutputBuilder {
  private readonly _value: bigint;
  private readonly _address: ErgoAddress;
  private readonly _height: number;
  private readonly _tokens: TokensCollection;
  private _registers: NonMandatoryRegisters;
  private _minting?: NewToken<bigint>;

  constructor(value: Amount, recipient: Base58String | ErgoTree, creationHeight: number) {
    this._value = toBigInt(value);
    this._address = isHex(recipient)
      ? ErgoAddress.fromErgoTree(recipient)
      : ErgoAddress.fromBase58(recipient);
    this._height = creationHeight;

    this._tokens = new TokensCollection();
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

  public get tokens(): TokensCollection {
    return this._tokens;
  }

  public get additionalRegisters(): NonMandatoryRegisters {
    return this._registers;
  }

  public get minting(): NewToken<bigint> | undefined {
    return this._minting;
  }

  public addTokens(tokens: TokenAmount<Amount>[] | TokenAmount<Amount>, options?: AddTokenOptions) {
    this._tokens.add(tokens, options);

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

  public extract(extractor: (context: { tokens: TokensCollection }) => void) {
    extractor({ tokens: this._tokens });
  }

  public build(transactionInputs?: UnsignedInput[] | Box<Amount>[]): BoxCandidate<string> {
    let tokens = this.tokens.toArray();

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
