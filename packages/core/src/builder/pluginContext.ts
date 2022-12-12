import { Amount, Box, OneOrMore, TokenAmount } from "@fleet-sdk/common";
import { NotAllowedTokenBurning, OutputBuilder, TransactionBuilder } from "..";
import { CollectionAddOptions } from "../models/collections/collection";

export type FleetPluginContext = {
  /**
   * Add and ensures selection of one or more inputs to the inputs list
   * @param inputs
   * @returns new list length
   */
  addInputs: (inputs: OneOrMore<Box<Amount>>, options?: CollectionAddOptions) => number;

  /**
   * Add one or more data inputs to the data inputs list
   * @param dataInputs
   * @returns new list length
   */
  addDataInputs: (dataInputs: OneOrMore<Box<Amount>>, options?: CollectionAddOptions) => number;

  /**
   * Add one or more outputs to the outputs list
   * @param outputs
   * @param options
   * @returns new list length
   */
  addOutputs: (outputs: OneOrMore<OutputBuilder>, options?: CollectionAddOptions) => number;

  /**
   * Burn tokens
   * @param tokens
   * @throws Burning tokens thought a plugin, requires explicitly permission
   * from {@link TransactionBuilder.configure}, if token burning is not allowed
   * it will thrown a {@link NotAllowedTokenBurning} exception.
   */
  burnTokens: (tokens: OneOrMore<TokenAmount<Amount>>) => void;
};

export function createPluginContext(transactionBuilder: TransactionBuilder): FleetPluginContext {
  return {
    addInputs: (inputs, options) =>
      transactionBuilder
        .from(inputs, options)
        .configureSelector((selector) =>
          selector.ensureInclusion(
            Array.isArray(inputs) ? inputs.map((input) => input.boxId) : inputs.boxId
          )
        ).inputs.length,
    addOutputs: (outputs, options) => transactionBuilder.to(outputs, options).outputs.length,
    addDataInputs: (dataInputs, options) =>
      transactionBuilder.withDataFrom(dataInputs, options).dataInputs.length,
    burnTokens: (tokens) => {
      if (!transactionBuilder.settings.canBurnTokensFromPlugins) {
        throw new NotAllowedTokenBurning();
      }
      transactionBuilder.burnTokens(tokens);
    }
  };
}
