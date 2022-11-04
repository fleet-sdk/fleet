import { InvalidInput, MalformedTransaction, NotAllowedTokenBurning } from "../errors";
import { ErgoAddress, InputsCollection, OutputsCollection, TokensCollection } from "../models";
import {
  Amount,
  Base58String,
  Box,
  BuildOutputType,
  EIP12UnsignedTransaction,
  HexString,
  TokenAmount,
  UnsignedTransaction
} from "../types";
import { chunk, some } from "../utils/arrayUtils";
import { ensureBigInt } from "../utils/bigIntUtils";
import { _0n } from "../utils/bitIntLiterals";
import { BoxAmounts, sumBoxes } from "../utils/boxUtils";
import { isDefined } from "../utils/objectUtils";
import { isHex } from "../utils/stringUtils";
import { OutputBuilder, SAFE_MIN_BOX_VALUE } from "./outputBuilder";
import { BoxSelector } from "./selector";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

type TransactionType<T> = T extends "default" ? UnsignedTransaction : EIP12UnsignedTransaction;

export const RECOMMENDED_MIN_FEE_VALUE = BigInt(1100000);
export const FEE_CONTRACT =
  "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304";

type SelectorSettings = Omit<BoxSelector<Box<bigint>>, "select">;
export type SelectorCallback = (selector: SelectorSettings) => void;

type EjectorContext = {
  inputs: InputsCollection;
  dataInputs: InputsCollection;
  outputs: OutputsCollection;
  burning: TokensCollection | undefined;
  settings: TransactionBuilderSettings;
  selection: (selectorCallBack?: SelectorCallback) => void;
};

export class TransactionBuilder {
  private readonly _inputs!: InputsCollection;
  private readonly _dataInputs!: InputsCollection;
  private readonly _outputs!: OutputsCollection;
  private readonly _settings!: TransactionBuilderSettings;
  private readonly _creationHeight!: number;

  private _selectorCallback?: SelectorCallback;
  private _changeAddress?: ErgoAddress;
  private _feeAmount?: bigint;
  private _burning?: TokensCollection;

  constructor(creationHeight: number) {
    this._inputs = new InputsCollection();
    this._dataInputs = new InputsCollection();
    this._outputs = new OutputsCollection();
    this._settings = new TransactionBuilderSettings();
    this._creationHeight = creationHeight;
  }

  public get inputs(): InputsCollection {
    return this._inputs;
  }

  public get dataInputs(): InputsCollection {
    return this._dataInputs;
  }

  public get outputs(): OutputsCollection {
    return this._outputs;
  }

  public get changeAddress(): ErgoAddress | undefined {
    return this._changeAddress;
  }

  public get fee(): bigint | undefined {
    return this._feeAmount;
  }

  public get burning(): TokensCollection | undefined {
    return this._burning;
  }

  public get settings(): TransactionBuilderSettings {
    return this._settings;
  }

  public get creationHeight(): number {
    return this._creationHeight;
  }

  /**
   * Syntax sugar to be used in composition with another methods
   *
   * @example
   * ```
   * new TransactionBuilder(height)
   *   .from(inputs)
   *   .and.from(otherInputs);
   * ```
   */
  public get and(): TransactionBuilder {
    return this;
  }

  public from(inputs: Box<Amount> | Box<Amount>[]): TransactionBuilder {
    this._inputs.add(inputs);

    return this;
  }

  public to(outputs: OutputBuilder[] | OutputBuilder): TransactionBuilder {
    this._outputs.add(outputs);

    return this;
  }

  public withDataFrom(dataInputs: Box<Amount>[] | Box<Amount>): TransactionBuilder {
    this._dataInputs.add(dataInputs);

    return this;
  }

  public sendChangeTo(address: ErgoAddress | Base58String | HexString): TransactionBuilder {
    if (typeof address === "string") {
      this._changeAddress = isHex(address)
        ? ErgoAddress.fromErgoTree(address)
        : ErgoAddress.fromBase58(address);
    } else {
      this._changeAddress = address;
    }

    return this;
  }

  public payFee(amount: Amount): TransactionBuilder {
    this._feeAmount = ensureBigInt(amount);

    return this;
  }

  public payMinFee(): TransactionBuilder {
    this.payFee(RECOMMENDED_MIN_FEE_VALUE);

    return this;
  }

  public burnTokens(tokens: TokenAmount<Amount> | TokenAmount<Amount>[]): TransactionBuilder {
    if (!this._burning) {
      this._burning = new TokensCollection();
    }
    this._burning.add(tokens);

    return this;
  }

  public configure(callback: (settings: TransactionBuilderSettings) => void): TransactionBuilder {
    callback(this._settings);

    return this;
  }

  public configureSelector(selectorCallback?: SelectorCallback): TransactionBuilder {
    this._selectorCallback = selectorCallback;

    return this;
  }

  public eject(ejector: (context: EjectorContext) => void): TransactionBuilder {
    const selection = (selectorCallback?: SelectorCallback) => {
      this._selectorCallback = selectorCallback;
    };

    ejector({
      inputs: this.inputs,
      dataInputs: this.dataInputs,
      outputs: this.outputs,
      burning: this.burning,
      settings: this.settings,
      selection: selection
    });

    return this;
  }

  public build(): UnsignedTransaction;
  public build<T extends BuildOutputType>(buildOutputType: T): TransactionType<T>;
  public build<T extends BuildOutputType>(buildOutputType?: T): TransactionType<T> {
    if (!this._validateTokenMinting()) {
      throw new MalformedTransaction("only one token can be minted per transaction.");
    }

    const outputs = this.outputs.clone();

    if (isDefined(this._feeAmount)) {
      outputs.add(new OutputBuilder(this._feeAmount, FEE_CONTRACT));
    }

    const selector = new BoxSelector(this.inputs.toArray());
    if (isDefined(this._selectorCallback)) {
      this._selectorCallback(selector);
    }

    const target = some(this._burning)
      ? outputs.sum({ tokens: this._burning.toArray() })
      : outputs.sum();
    let inputs = selector.select(target);

    if (isDefined(this._changeAddress)) {
      let change = this._calcDiff(sumBoxes(inputs), target);

      if (some(change.tokens)) {
        let requiredNanoErgs = this._calcRequiredNanoErgsForChange(change.tokens.length);
        while (requiredNanoErgs > change.nanoErgs) {
          inputs = selector.select({
            nanoErgs: target.nanoErgs + requiredNanoErgs,
            tokens: target.tokens
          });
          change = this._calcDiff(sumBoxes(inputs), target);
          requiredNanoErgs = this._calcRequiredNanoErgsForChange(change.tokens.length);
        }

        const chunkedTokens = chunk(change.tokens, this._settings.maxTokensPerChangeBox);
        for (const tokens of chunkedTokens) {
          const nanoErgs =
            change.nanoErgs > requiredNanoErgs
              ? change.nanoErgs - requiredNanoErgs + SAFE_MIN_BOX_VALUE
              : SAFE_MIN_BOX_VALUE;
          change.nanoErgs -= nanoErgs;

          outputs.add(new OutputBuilder(nanoErgs, this._changeAddress).addTokens(tokens));
        }
      }

      if (change.nanoErgs > _0n) {
        outputs.add(new OutputBuilder(change.nanoErgs, this._changeAddress));
      }
    }

    for (const input of inputs) {
      if (!input.isValid()) {
        throw new InvalidInput(input.boxId);
      }
    }

    const unsignedTransaction = {
      inputs: inputs.map((input) => input.toUnsignedInputObject(buildOutputType || "default")),
      dataInputs: this.dataInputs
        .toArray()
        .map((input) => input.toObject(buildOutputType || "default")),
      outputs: outputs
        .toArray()
        .map((output) =>
          output.setCreationHeight(this._creationHeight, { replace: false }).build(inputs)
        )
    } as TransactionType<T>;

    let burning = this._calcBurningBalance(unsignedTransaction, inputs);
    if (burning.nanoErgs > _0n) {
      throw new MalformedTransaction("it's not possible to burn ERG.");
    }

    if (some(burning.tokens) && some(this._burning)) {
      burning = this._calcDiff(burning, { nanoErgs: _0n, tokens: this._burning.toArray() });
    }

    if (!this._settings.canBurnTokens && some(burning.tokens)) {
      throw new NotAllowedTokenBurning();
    }

    return unsignedTransaction;
  }

  private _validateTokenMinting(): boolean {
    let mintingCount = 0;

    for (const output of this._outputs) {
      if (isDefined(output.minting)) {
        mintingCount++;

        if (mintingCount > 1) {
          return false;
        }
      }
    }

    return true;
  }

  private _calcBurningBalance(
    unsignedTransaction: UnsignedTransaction,
    inputs: Box<bigint>[]
  ): BoxAmounts {
    const usedInputs = inputs.filter((input) =>
      isDefined(unsignedTransaction.inputs.find((txInput) => txInput.boxId === input.boxId))
    );

    return this._calcDiff(sumBoxes(usedInputs), sumBoxes(unsignedTransaction.outputs));
  }

  private _calcChangeLength(tokensLength: number): number {
    return Math.ceil(tokensLength / this._settings.maxTokensPerChangeBox);
  }

  private _calcRequiredNanoErgsForChange(
    tokensLength: number,
    minNanoErgsPerBox = SAFE_MIN_BOX_VALUE
  ): bigint {
    return minNanoErgsPerBox * BigInt(this._calcChangeLength(tokensLength));
  }

  private _calcDiff(inputs: BoxAmounts, outputs: BoxAmounts): BoxAmounts {
    const tokens: TokenAmount<bigint>[] = [];
    const nanoErgs = inputs.nanoErgs - outputs.nanoErgs;

    for (const token of inputs.tokens) {
      const balance =
        token.amount - (outputs.tokens.find((t) => t.tokenId === token.tokenId)?.amount || _0n);

      if (balance > _0n) {
        tokens.push({ tokenId: token.tokenId, amount: balance });
      }
    }

    return { nanoErgs, tokens };
  }
}
