import {
  type Amount,
  type Base58String,
  type Box,
  type CollectionAddOptions,
  type HexString,
  type OneOrMore,
  type TokenAmount,
  _0n,
  byteSizeOf,
  chunk,
  ensureBigInt,
  first,
  isDefined,
  isHex,
  isUndefined,
  Network,
  some,
  utxoDiff,
  utxoSum
} from "@fleet-sdk/common";
import { estimateVLQSize } from "@fleet-sdk/serializer";
import { InvalidInput, MalformedTransaction, NotAllowedTokenBurning } from "../errors";
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

/**
 * Options for including inputs in the transaction builder
 */
type InputsInclusionOptions = {
  /**
   * If true, all the inputs will be included in the
   * transaction while preserving the original order.
   */
  ensureInclusion?: boolean;
};

export class TransactionBuilder {
  readonly #inputs: InputsCollection;
  readonly #dataInputs: InputsCollection;
  readonly #outputs: OutputsCollection;
  readonly #settings: TransactionBuilderSettings;

  #creationHeight: number;
  #ensureInclusion?: Set<string>;
  #selectorCallbacks?: SelectorCallback[];
  #changeAddress?: ErgoAddress;
  #feeAmount?: bigint;
  #burning?: TokensCollection;
  #plugins?: PluginListItem[];

  constructor(creationHeight: number, parent?: ErgoUnsignedTransaction) {
    this.#inputs = new InputsCollection();
    this.#dataInputs = new InputsCollection();
    this.#outputs = new OutputsCollection();
    this.#settings = new TransactionBuilderSettings();
    this.#creationHeight = creationHeight;
  }

  get inputs(): InputsCollection {
    return this.#inputs;
  }

  get dataInputs(): InputsCollection {
    return this.#dataInputs;
  }

  get outputs(): OutputsCollection {
    return this.#outputs;
  }

  get changeAddress(): ErgoAddress | undefined {
    return this.#changeAddress;
  }

  get fee(): bigint | undefined {
    return this.#feeAmount;
  }

  get burning(): TokensCollection | undefined {
    return this.#burning;
  }

  get settings(): TransactionBuilderSettings {
    return this.#settings;
  }

  get creationHeight(): number {
    return this.#creationHeight;
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
  get and(): TransactionBuilder {
    return this;
  }

  atHeight(height: number): TransactionBuilder {
    this.#creationHeight = height;
    return this;
  }

  from(
    inputs: OneOrMore<Box<Amount>> | CollectionLike<Box<Amount>>,
    options: InputsInclusionOptions = { ensureInclusion: false }
  ): TransactionBuilder {
    const items = isCollectionLike(inputs) ? inputs.toArray() : inputs;
    if (options.ensureInclusion) this.#ensureInclusionOf(items);

    this.#inputs.add(items);
    return this;
  }

  #ensureInclusionOf(inputs: OneOrMore<Box<Amount>>): void {
    if (!this.#ensureInclusion) this.#ensureInclusion = new Set();

    if (Array.isArray(inputs)) {
      for (const input of inputs) this.#ensureInclusion.add(input.boxId);
    } else {
      this.#ensureInclusion.add(inputs.boxId);
    }
  }

  to(
    outputs: OneOrMore<OutputBuilder>,
    options?: CollectionAddOptions
  ): TransactionBuilder {
    this.#outputs.add(outputs, options);
    return this;
  }

  withDataFrom(
    dataInputs: OneOrMore<Box<Amount>>,
    options?: CollectionAddOptions
  ): TransactionBuilder {
    this.#dataInputs.add(dataInputs, options);

    return this;
  }

  sendChangeTo(address: ErgoAddress | Base58String | HexString): TransactionBuilder {
    if (typeof address === "string") {
      this.#changeAddress = isHex(address)
        ? ErgoAddress.fromErgoTree(address, Network.Mainnet)
        : ErgoAddress.fromBase58(address);
    } else {
      this.#changeAddress = address;
    }

    return this;
  }

  payFee(amount: Amount): TransactionBuilder {
    this.#feeAmount = ensureBigInt(amount);
    return this;
  }

  payMinFee(): TransactionBuilder {
    this.payFee(RECOMMENDED_MIN_FEE_VALUE);
    return this;
  }

  burnTokens(tokens: OneOrMore<TokenAmount<Amount>>): TransactionBuilder {
    if (!this.#burning) this.#burning = new TokensCollection();
    this.#burning.add(tokens);
    return this;
  }

  configure(callback: ConfigureCallback): TransactionBuilder {
    callback(this.#settings);
    return this;
  }

  configureSelector(selectorCallback: SelectorCallback): TransactionBuilder {
    if (isUndefined(this.#selectorCallbacks)) this.#selectorCallbacks = [];
    this.#selectorCallbacks.push(selectorCallback);
    return this;
  }

  extend(plugins: FleetPlugin): TransactionBuilder {
    if (!this.#plugins) this.#plugins = [];
    this.#plugins.push({ execute: plugins, pending: true });
    return this;
  }

  eject(ejector: (context: EjectorContext) => void): TransactionBuilder {
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

  build(): ErgoUnsignedTransaction {
    if (some(this.#plugins)) {
      const context = createPluginContext(this);
      for (const plugin of this.#plugins) {
        if (plugin.pending) {
          plugin.execute(context);
          plugin.pending = false;
        }
      }
    }

    if (this.#isMinting()) {
      if (this.#isMoreThanOneTokenBeingMinted()) {
        throw new MalformedTransaction("only one token can be minted per transaction.");
      }

      if (this.#isTheSameTokenBeingMintedFromOutsideTheMintingBox()) {
        throw new NonStandardizedMinting(
          "EIP-4 tokens cannot be minted from outside of the minting box."
        );
      }
    }

    this.outputs
      .toArray()
      .map((output) =>
        output.setCreationHeight(this.#creationHeight, { replace: false })
      );
    const outputs = this.outputs.clone();

    if (isDefined(this.#feeAmount)) {
      outputs.add(new OutputBuilder(this.#feeAmount, FEE_CONTRACT));
    }

    const selector = new BoxSelector(this.inputs.toArray());
    if (this.#ensureInclusion?.size) {
      selector.ensureInclusion(Array.from(this.#ensureInclusion));
    }

    if (some(this.#selectorCallbacks)) {
      for (const selectorCallBack of this.#selectorCallbacks) {
        selectorCallBack(selector);
      }
    }

    const target = some(this.#burning)
      ? outputs.sum({ tokens: this.#burning.toArray() })
      : outputs.sum();
    let inputs = selector.select(target);

    if (isDefined(this.#changeAddress)) {
      const changeBoxes: OutputBuilder[] = [];
      const firstInputId = inputs[0].boxId;
      const manualMintingTokenId = target.tokens.some((x) => x.tokenId === firstInputId)
        ? firstInputId
        : undefined;

      if (manualMintingTokenId) {
        target.tokens = target.tokens.filter((x) => x.tokenId !== manualMintingTokenId);
      }

      let change = utxoDiff(utxoSum(inputs), target);

      if (some(change.tokens)) {
        let minRequiredNanoErgs = estimateMinChangeValue({
          changeAddress: this.#changeAddress,
          creationHeight: this.#creationHeight,
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
            changeAddress: this.#changeAddress,
            creationHeight: this.#creationHeight,
            tokens: change.tokens,
            maxTokensPerBox: this.settings.maxTokensPerChangeBox,
            baseIndex: this.outputs.length + 1
          });
        }

        const chunkedTokens = chunk(change.tokens, this.#settings.maxTokensPerChangeBox);
        for (const tokens of chunkedTokens) {
          const output = new OutputBuilder(estimateMinBoxValue(), this.#changeAddress)
            .setCreationHeight(this.#creationHeight)
            .addTokens(tokens)
            .setFlags({ change: true });

          change.nanoErgs -= output.value;
          changeBoxes.push(output);
        }
      }

      if (change.nanoErgs > _0n) {
        if (!changeBoxes.length || this.settings.shouldIsolateErgOnChange) {
          changeBoxes.unshift(
            new OutputBuilder(change.nanoErgs, this.#changeAddress)
              .setCreationHeight(this.#creationHeight)
              .setFlags({ change: true })
          );
        } else {
          const firstChangeBox = first(changeBoxes);
          firstChangeBox.setValue(firstChangeBox.value + change.nanoErgs);
        }
      }

      outputs.add(changeBoxes);
    }

    for (const input of inputs) {
      if (!input.isValid()) throw new InvalidInput(input.boxId);
    }

    const buildedOutputs = outputs
      .toArray()
      .map((output) =>
        output.setCreationHeight(this.#creationHeight, { replace: false }).build(inputs)
      );

    const unsignedTransaction = new ErgoUnsignedTransaction(
      inputs,
      this.dataInputs.toArray(),
      buildedOutputs,
      this
    );

    let burning = unsignedTransaction.burning;
    if (burning.nanoErgs > _0n) {
      throw new MalformedTransaction("it's not possible to burn ERG.");
    }

    if (some(burning.tokens) && some(this.#burning)) {
      burning = utxoDiff(burning, {
        nanoErgs: _0n,
        tokens: this.#burning.toArray()
      });
    }

    if (!this.#settings.canBurnTokens && some(burning.tokens)) {
      throw new NotAllowedTokenBurning();
    }

    return unsignedTransaction;
  }

  #getMintingOutput(): OutputBuilder | undefined {
    for (const output of this.#outputs) {
      if (output.minting) return output;
    }

    return;
  }

  #isMinting(): boolean {
    return this.#getMintingOutput() !== undefined;
  }

  #getMintingTokenId(): string | undefined {
    return this.#getMintingOutput()?.minting?.tokenId;
  }

  #isMoreThanOneTokenBeingMinted(): boolean {
    let mintingCount = 0;

    for (const output of this.#outputs) {
      if (output.minting) {
        mintingCount++;
        if (mintingCount > 1) return true;
      }
    }

    return false;
  }

  #isTheSameTokenBeingMintedFromOutsideTheMintingBox(): boolean {
    const mintingTokenId = this.#getMintingTokenId();
    if (isUndefined(mintingTokenId)) return false;

    let count = 0;
    for (const output of this.#outputs) {
      if (output.assets.contains(mintingTokenId)) {
        count++;
        if (count > 1) return true;
      }
    }

    return false;
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
  for (let i = 0; i < neededBoxes; i++) size += estimateVLQSize(baseIndex + i);

  for (const token of tokens) {
    size += byteSizeOf(token.tokenId) + estimateVLQSize(token.amount);
  }

  if (tokens.length > maxTokensPerBox) {
    if (tokens.length % maxTokensPerBox > 0) {
      size +=
        estimateVLQSize(maxTokensPerBox) * Math.floor(tokens.length / maxTokensPerBox);
      size += estimateVLQSize(tokens.length % maxTokensPerBox);
    } else {
      size += estimateVLQSize(maxTokensPerBox) * neededBoxes;
    }
  } else {
    size += estimateVLQSize(tokens.length);
  }

  return size;
}
