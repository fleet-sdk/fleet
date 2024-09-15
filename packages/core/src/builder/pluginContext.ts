import type {
  Amount,
  Box,
  CollectionAddOptions,
  OneOrMore,
  TokenAmount
} from "@fleet-sdk/common";
import { NotAllowedTokenBurning, type OutputBuilder, type TransactionBuilder } from "..";

export type FleetPluginContext = {
  /**
   * Add and ensures selection of one or more inputs to the inputs list
   * @param inputs
   * @returns new list length
   */
  addInputs: (inputs: OneOrMore<Box<Amount>>) => number;

  /**
   * Add one or more data inputs to the data inputs list
   * @param dataInputs
   * @returns new list length
   */
  addDataInputs: (
    dataInputs: OneOrMore<Box<Amount>>,
    options?: CollectionAddOptions
  ) => number;

  /**
   * Add one or more outputs to the outputs list
   * @param outputs
   * @param options
   * @returns new list length
   */
  addOutputs: (
    outputs: OneOrMore<OutputBuilder>,
    options?: CollectionAddOptions
  ) => number;

  /**
   * Burn tokens
   * @param tokens
   * @throws Burning tokens thought a plugin, requires explicitly permission
   * from {@link TransactionBuilder.configure}, if token burning is not allowed
   * it will thrown a {@link NotAllowedTokenBurning} exception.
   */
  burnTokens: (tokens: OneOrMore<TokenAmount<Amount>>) => void;

  /**
   * Set transaction fee amount
   * @param amount amount in nanoergs
   */
  setFee: (amount: Amount) => void;
};

export function createPluginContext(
  transactionBuilder: TransactionBuilder
): FleetPluginContext {
  return {
    addInputs: (inputs) =>
      transactionBuilder
        .from(inputs, { ensureInclusion: true })
        .inputs.length,
    addOutputs: (outputs, options) =>
      transactionBuilder.to(outputs, options).outputs.length,
    addDataInputs: (dataInputs, options) =>
      transactionBuilder.withDataFrom(dataInputs, options).dataInputs.length,
    burnTokens: (tokens) => {
      if (!transactionBuilder.settings.canBurnTokensFromPlugins) {
        throw new NotAllowedTokenBurning();
      }
      transactionBuilder.burnTokens(tokens);
    },
    setFee: (amount) => transactionBuilder.payFee(amount)
  };
}
