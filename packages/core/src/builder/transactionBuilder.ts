import {
  _0n,
  type Amount,
  type Base58String,
  type Box,
  byteSizeOf,
  chunk,
  type CollectionAddOptions,
  ensureBigInt,
  first,
  type HexString,
  isDefined,
  isHex,
  isUndefined,
  Network,
  type OneOrMore,
  some,
  type TokenAmount,
  utxoDiff,
  utxoSum
} from "@fleet-sdk/common";
import { estimateVLQSize } from "@fleet-sdk/serializer";
import {
  InvalidInput,
  MalformedTransaction,
  NotAllowedTokenBurning
} from "../errors";
import { NonStandardizedMinting } from "../errors/nonStandardizedMinting";
import {
  ErgoAddress,
  InputsCollection,
  OutputsCollection,
  TokensCollection
} from "../models";
import { ErgoUnsignedTransaction } from "../models/ergoUnsignedTransaction";
import {
  BOX_VALUE_PER_BYTE,
  estimateMinBoxValue,
  OutputBuilder,
  SAFE_MIN_BOX_VALUE
} from "./outputBuilder";
import { createPluginContext, type FleetPluginContext } from "./pluginContext";
import { BoxSelector } from "./selector";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

type PluginListItem = { execute: FleetPlugin; pending: boolean };
type SelectorSettings = Omit<BoxSelector<Box<bigint>>, "select">;
export type ConfigureCallback = (settings: TransactionBuilderSettings) => void;
export type SelectorCallback = (selector: SelectorSettings) => void;
export type FleetPlugin = (context: FleetPluginContext) => void;
export type CollectionLike<T> = { toArray(): T[] };

export const RECOMMENDED_MIN_FEE_VALUE = BigInt(1100000);
export const FEE_CONTRACT =
  "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304";

type EjectorContext = {
  inputs: InputsCollection;
  dataInputs: InputsCollection;
  outputs: OutputsCollection;
  burning: TokensCollection | undefined;
  settings: TransactionBuilderSettings;
  selection: (selectorCallBack: SelectorCallback) => void;
};

export class TransactionBuilder {
  private readonly _inputs!: InputsCollection;
  private readonly _dataInputs!: InputsCollection;
  private readonly _outputs!: OutputsCollection;
  private readonly _settings!: TransactionBuilderSettings;
  private readonly _creationHeight!: number;

  private _selectorCallbacks?: SelectorCallback[];
  private _changeAddress?: ErgoAddress;
  private _feeAmount?: bigint;
  private _burning?: TokensCollection;
  private _plugins?: PluginListItem[];

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

  public from(
    inputs: OneOrMore<Box<Amount>> | CollectionLike<Box<Amount>>
  ): TransactionBuilder {
    this._inputs.add(isCollectionLike(inputs) ? inputs.toArray() : inputs);
    return this;
  }

  public to(
    outputs: OneOrMore<OutputBuilder>,
    options?: CollectionAddOptions
  ): TransactionBuilder {
    this._outputs.add(outputs, options);

    return this;
  }

  public withDataFrom(
    dataInputs: OneOrMore<Box<Amount>>,
    options?: CollectionAddOptions
  ): TransactionBuilder {
    this._dataInputs.add(dataInputs, options);

    return this;
  }

  public sendChangeTo(
    address: ErgoAddress | Base58String | HexString
  ): TransactionBuilder {
    if (typeof address === "string") {
      this._changeAddress = isHex(address)
        ? ErgoAddress.fromErgoTree(address, Network.Mainnet)
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

  public burnTokens(
    tokens: OneOrMore<TokenAmount<Amount>>
  ): TransactionBuilder {
    if (!this._burning) {
      this._burning = new TokensCollection();
    }
    this._burning.add(tokens);

    return this;
  }

  public configure(callback: ConfigureCallback): TransactionBuilder {
    callback(this._settings);

    return this;
  }

  public configureSelector(
    selectorCallback: SelectorCallback
  ): TransactionBuilder {
    if (isUndefined(this._selectorCallbacks)) {
      this._selectorCallbacks = [];
    }

    this._selectorCallbacks.push(selectorCallback);

    return this;
  }

  public extend(plugins: FleetPlugin): TransactionBuilder {
    if (!this._plugins) {
      this._plugins = [];
    }
    this._plugins.push({ execute: plugins, pending: true });

    return this;
  }

  public eject(ejector: (context: EjectorContext) => void): TransactionBuilder {
    ejector({
      inputs: this.inputs,
      dataInputs: this.dataInputs,
      outputs: this.outputs,
      burning: this.burning,
      settings: this.settings,
      selection: (selectorCallback: SelectorCallback) => {
        this.configureSelector(selectorCallback);
      }
    });

    return this;
  }

  public build(): ErgoUnsignedTransaction {
    if (some(this._plugins)) {
      const context = createPluginContext(this);
      for (const plugin of this._plugins) {
        if (plugin.pending) {
          plugin.execute(context);
          plugin.pending = false;
        }
      }
    }

    if (this._isMinting()) {
      if (this._isMoreThanOneTokenBeingMinted()) {
        throw new MalformedTransaction(
          "only one token can be minted per transaction."
        );
      }

      if (this._isTheSameTokenBeingMintedFromOutsideTheMintingBox()) {
        throw new NonStandardizedMinting(
          "EIP-4 tokens cannot be minted from outside of the minting box."
        );
      }
    }

    this.outputs
      .toArray()
      .map((output) =>
        output.setCreationHeight(this._creationHeight, { replace: false })
      );
    const outputs = this.outputs.clone();

    if (isDefined(this._feeAmount)) {
      outputs.add(new OutputBuilder(this._feeAmount, FEE_CONTRACT));
    }

    const selector = new BoxSelector(this.inputs.toArray());
    if (some(this._selectorCallbacks)) {
      for (const selectorCallBack of this._selectorCallbacks) {
        selectorCallBack(selector);
      }
    }

    const target = some(this._burning)
      ? outputs.sum({ tokens: this._burning.toArray() })
      : outputs.sum();
    let inputs = selector.select(target);

    if (isDefined(this._changeAddress)) {
      let change = utxoDiff(utxoSum(inputs), target);
      const changeBoxes: OutputBuilder[] = [];

      if (some(change.tokens)) {
        let minRequiredNanoErgs = estimateMinChangeValue({
          changeAddress: this._changeAddress,
          creationHeight: this._creationHeight,
          tokens: change.tokens,
          maxTokensPerBox: this.settings.maxTokensPerChangeBox,
          baseIndex: this.outputs.length + 1
        });

        while (minRequiredNanoErgs > change.nanoErgs) {
          inputs = selector.select({
            nanoErgs: target.nanoErgs + minRequiredNanoErgs,
            tokens: target.tokens
          });

          change = utxoDiff(utxoSum(inputs), target);
          minRequiredNanoErgs = estimateMinChangeValue({
            changeAddress: this._changeAddress,
            creationHeight: this._creationHeight,
            tokens: change.tokens,
            maxTokensPerBox: this.settings.maxTokensPerChangeBox,
            baseIndex: this.outputs.length + 1
          });
        }

        const chunkedTokens = chunk(
          change.tokens,
          this._settings.maxTokensPerChangeBox
        );
        for (const tokens of chunkedTokens) {
          const output = new OutputBuilder(
            estimateMinBoxValue(),
            this._changeAddress,
            this._creationHeight
          ).addTokens(tokens);

          change.nanoErgs -= output.value;
          changeBoxes.push(output);
        }
      }

      if (change.nanoErgs > _0n) {
        if (some(changeBoxes)) {
          if (this.settings.shouldIsolateErgOnChange) {
            outputs.add(
              new OutputBuilder(change.nanoErgs, this._changeAddress)
            );
          } else {
            const firstChangeBox = first(changeBoxes);
            firstChangeBox.setValue(firstChangeBox.value + change.nanoErgs);
          }

          outputs.add(changeBoxes);
        } else {
          outputs.add(new OutputBuilder(change.nanoErgs, this._changeAddress));
        }
      }
    }

    for (const input of inputs) {
      if (!input.isValid()) {
        throw new InvalidInput(input.boxId);
      }
    }

    const unsignedTransaction = new ErgoUnsignedTransaction(
      inputs,
      this.dataInputs.toArray(),
      outputs
        .toArray()
        .map((output) =>
          output
            .setCreationHeight(this._creationHeight, { replace: false })
            .build(inputs)
        )
    );

    let burning = unsignedTransaction.burning;
    if (burning.nanoErgs > _0n) {
      throw new MalformedTransaction("it's not possible to burn ERG.");
    }

    if (some(burning.tokens) && some(this._burning)) {
      burning = utxoDiff(burning, {
        nanoErgs: _0n,
        tokens: this._burning.toArray()
      });
    }

    if (!this._settings.canBurnTokens && some(burning.tokens)) {
      throw new NotAllowedTokenBurning();
    }

    return unsignedTransaction;
  }

  private _isMinting(): boolean {
    for (const output of this._outputs) {
      if (output.minting) return true;
    }

    return false;
  }

  private _isMoreThanOneTokenBeingMinted(): boolean {
    let mintingCount = 0;

    for (const output of this._outputs) {
      if (isDefined(output.minting)) {
        mintingCount++;
        if (mintingCount > 1) return true;
      }
    }

    return false;
  }

  private _isTheSameTokenBeingMintedFromOutsideTheMintingBox(): boolean {
    const mintingTokenId = this._getMintingTokenId();
    if (isUndefined(mintingTokenId)) return false;

    let count = 0;
    for (const output of this._outputs) {
      if (output.assets.contains(mintingTokenId)) {
        count++;
        if (count > 1) return true;
      }
    }

    return false;
  }

  private _getMintingTokenId(): string | undefined {
    let tokenId = undefined;
    for (const output of this._outputs) {
      if (output.minting) {
        tokenId = output.minting.tokenId;
        break;
      }
    }

    return tokenId;
  }
}

function isCollectionLike<T>(obj: unknown): obj is CollectionLike<T> {
  return (obj as CollectionLike<T>).toArray !== undefined;
}

type ChangeEstimationParams = {
  changeAddress: ErgoAddress;
  creationHeight: number;
  tokens: TokenAmount<bigint>[];
  baseIndex: number;
  maxTokensPerBox: number;
};

function estimateMinChangeValue(params: ChangeEstimationParams): bigint {
  const size = BigInt(estimateChangeSize(params));

  return size * BOX_VALUE_PER_BYTE;
}

function estimateChangeSize({
  changeAddress,
  creationHeight,
  tokens,
  baseIndex,
  maxTokensPerBox
}: ChangeEstimationParams): number {
  const neededBoxes = Math.ceil(tokens.length / maxTokensPerBox);
  let size = 0;
  size += estimateVLQSize(SAFE_MIN_BOX_VALUE);
  size += byteSizeOf(changeAddress.ergoTree);
  size += estimateVLQSize(creationHeight);
  size += estimateVLQSize(0); // empty registers length
  size += 32; // BLAKE 256 hash length

  size = size * neededBoxes;
  for (let i = 0; i < neededBoxes; i++) {
    size += estimateVLQSize(baseIndex + i);
  }

  for (const token of tokens) {
    size += byteSizeOf(token.tokenId) + estimateVLQSize(token.amount);
  }

  if (tokens.length > maxTokensPerBox) {
    if (tokens.length % maxTokensPerBox > 0) {
      size +=
        estimateVLQSize(maxTokensPerBox) *
        Math.floor(tokens.length / maxTokensPerBox);
      size += estimateVLQSize(tokens.length % maxTokensPerBox);
    } else {
      size += estimateVLQSize(maxTokensPerBox) * neededBoxes;
    }
  } else {
    size += estimateVLQSize(tokens.length);
  }

  return size;
}
