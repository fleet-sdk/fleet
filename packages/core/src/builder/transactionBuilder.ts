import {
  type Amount,
  type Base58String,
  type Box,
  type BoxSummary,
  type CollectionAddOptions,
  FEE_CONTRACT,
  type HexString,
  Network,
  type NewToken,
  type OneOrMore,
  RECOMMENDED_MIN_FEE_VALUE,
  type TokenAmount,
  _0n,
  byteSizeOf,
  chunk,
  ensureBigInt,
  first,
  isDefined,
  isEmpty,
  isHex,
  isUndefined,
  some,
  utxoDiff,
  utxoSum
} from "@fleet-sdk/common";
import { utf8 } from "@fleet-sdk/crypto";
import { SByte, SColl, estimateVLQSize } from "@fleet-sdk/serializer";
import {
  InsufficientInputs,
  InvalidInput,
  MalformedTransaction,
  NotAllowedTokenBurning
} from "../errors";
import { NonStandardizedMinting } from "../errors/nonStandardizedMinting";
import { ErgoAddress, InputsCollection, OutputsCollection, TokensCollection } from "../models";
import { ErgoUnsignedTransaction } from "../models/ergoUnsignedTransaction";
import {
  BOX_VALUE_PER_BYTE,
  OutputBuilder,
  SAFE_MIN_BOX_VALUE,
  estimateMinBoxValue
} from "./outputBuilder";
import { type FleetPluginContext, createPluginContext } from "./pluginContext";
import { BoxSelector } from "./selector";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

type PluginListItem = { execute: FleetPlugin; pending: boolean };
type SelectorSettings = Omit<BoxSelector<Box<bigint>>, "select">;
export type ConfigureCallback = (settings: TransactionBuilderSettings) => void;
export type SelectorCallback = (selector: SelectorSettings) => void;
export type FleetPlugin = (context: FleetPluginContext) => void;
export type CollectionLike<T> = { toArray(): T[] };

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

  constructor(creationHeight: number) {
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

  to(outputs: OneOrMore<OutputBuilder>, options?: CollectionAddOptions): TransactionBuilder {
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
    const items = Array.isArray(tokens) ? tokens : [tokens];
    for (const token of items) {
      if (ensureBigInt(token.amount) <= _0n) {
        throw new RangeError("Token burning amount must be greater than zero.");
      }
    }

    if (!this.#burning) this.#burning = new TokensCollection();
    this.#burning.add(items);
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

    const mintingInfo = this.#getMintingInfo();
    if (mintingInfo) {
      if (this.#isMoreThanOneTokenBeingMinted()) {
        throw new MalformedTransaction("only one token can be minted per transaction.");
      }

      if (
        isDefined(mintingInfo.token.tokenId) &&
        this.#isTokenPresentInOtherOutputs(mintingInfo.output, mintingInfo.token.tokenId)
      ) {
        throw new NonStandardizedMinting(
          "EIP-4 tokens cannot be minted from outside of the minting box."
        );
      }
    }

    const outputs = new OutputsCollection(
      this.outputs.toArray().map((output) => {
        const prepared = output.clone();
        prepared.setCreationHeight(this.#creationHeight, { replace: false });

        if (prepared.minting && isEmpty(prepared.additionalRegisters)) {
          prepared.setAdditionalRegisters({
            R4: SColl(SByte, utf8.decode(prepared.minting.name || "")),
            R5: SColl(SByte, utf8.decode(prepared.minting.description || "")),
            R6: SColl(SByte, utf8.decode(prepared.minting.decimals?.toString() || "0"))
          });
        }

        return prepared;
      })
    );

    if (isDefined(this.#feeAmount)) {
      outputs.add(new OutputBuilder(this.#feeAmount, FEE_CONTRACT, this.#creationHeight));
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

    if (isEmpty(inputs)) {
      throw new MalformedTransaction("at least one input is required.");
    }

    if (isDefined(this.#changeAddress)) {
      const changeAddress = this.#changeAddress;
      const changeBoxes: OutputBuilder[] = [];
      const firstInputId = inputs[0].boxId;
      const manualMintingTokenId = target.tokens.some((x) => x.tokenId === firstInputId)
        ? firstInputId
        : undefined;

      if (manualMintingTokenId) {
        target.tokens = target.tokens.filter((x) => x.tokenId !== manualMintingTokenId);
        selector.ensureInclusion(manualMintingTokenId);
      }

      const minErgChangeValue = estimateMinChangeValue({
        changeAddress,
        creationHeight: this.#creationHeight,
        tokens: [],
        maxTokensPerBox: this.settings.maxTokensPerChangeBox
      });

      const getMinRequiredNanoErgs = (change: BoxSummary): bigint => {
        if (some(change.tokens)) {
          const tokensMinValue = estimateMinChangeValue({
            changeAddress,
            creationHeight: this.#creationHeight,
            tokens: change.tokens,
            maxTokensPerBox: this.settings.maxTokensPerChangeBox
          });

          if (this.settings.shouldIsolateErgOnChange && change.nanoErgs > tokensMinValue) {
            return tokensMinValue + minErgChangeValue;
          }

          return tokensMinValue;
        }

        return change.nanoErgs > _0n ? minErgChangeValue : _0n;
      };

      let change = utxoDiff(utxoSum(inputs), target);
      let minRequiredNanoErgs = getMinRequiredNanoErgs(change);

      while (minRequiredNanoErgs > change.nanoErgs) {
        inputs = selector.select({
          nanoErgs: target.nanoErgs + minRequiredNanoErgs,
          tokens: target.tokens
        });

        change = utxoDiff(utxoSum(inputs), target);
        minRequiredNanoErgs = getMinRequiredNanoErgs(change);
      }

      if (some(change.tokens)) {
        const chunkedTokens = chunk(change.tokens, this.#settings.maxTokensPerChangeBox);
        for (const tokens of chunkedTokens) {
          const output = new OutputBuilder(estimateMinBoxValue(), changeAddress)
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
            new OutputBuilder(change.nanoErgs, changeAddress)
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

    if (outputs.isEmpty) {
      throw new MalformedTransaction("at least one output is required.");
    }

    if (
      mintingInfo &&
      isUndefined(mintingInfo.token.tokenId) &&
      this.#isTokenPresentInOtherOutputs(mintingInfo.output, inputs[0].boxId)
    ) {
      throw new NonStandardizedMinting(
        "EIP-4 tokens cannot be minted from outside of the minting box."
      );
    }

    for (const input of inputs) {
      if (!input.isValid()) throw new InvalidInput(input.boxId);
    }

    const buildedOutputs = outputs.toArray().map((output) => output.build(inputs));

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

    if (burning.nanoErgs < _0n) {
      throw new InsufficientInputs({ nanoErgs: -burning.nanoErgs });
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

  #getMintingInfo(): { output: OutputBuilder; token: NewToken<bigint> } | undefined {
    for (const output of this.#outputs) {
      if (output.minting) return { output, token: output.minting };
    }

    return;
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

  #isTokenPresentInOtherOutputs(mintingOutput: OutputBuilder, tokenId: string): boolean {
    for (const output of this.#outputs) {
      if (output !== mintingOutput && output.assets.contains(tokenId)) {
        return true;
      }
    }

    return false;
  }
}

function isCollectionLike<T>(obj: unknown): obj is CollectionLike<T> {
  return (obj as CollectionLike<T>).toArray !== undefined;
}

const MAX_UINT16_VALUE = 65535;

type ChangeEstimationParams = {
  changeAddress: ErgoAddress;
  creationHeight: number;
  tokens: TokenAmount<bigint>[];
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
  maxTokensPerBox
}: ChangeEstimationParams): number {
  const neededBoxes = Math.max(1, Math.ceil(tokens.length / maxTokensPerBox));
  let size = 0;
  size += estimateVLQSize(SAFE_MIN_BOX_VALUE);
  size += byteSizeOf(changeAddress.ergoTree);
  size += estimateVLQSize(creationHeight);
  size += estimateVLQSize(0); // empty registers length
  size += 32; // BLAKE 256 hash length
  size += estimateVLQSize(MAX_UINT16_VALUE);

  size = size * neededBoxes;

  for (const token of tokens) {
    size += byteSizeOf(token.tokenId) + estimateVLQSize(token.amount);
  }

  if (tokens.length > maxTokensPerBox) {
    if (tokens.length % maxTokensPerBox > 0) {
      size += estimateVLQSize(maxTokensPerBox) * Math.floor(tokens.length / maxTokensPerBox);
      size += estimateVLQSize(tokens.length % maxTokensPerBox);
    } else {
      size += estimateVLQSize(maxTokensPerBox) * neededBoxes;
    }
  } else {
    size += estimateVLQSize(tokens.length);
  }

  return size;
}
