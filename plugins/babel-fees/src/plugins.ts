import { ensureBigInt } from "@fleet-sdk/common";
import {
  Amount,
  Box,
  ErgoUnsignedInput,
  FleetPlugin,
  OutputBuilder,
  SAFE_MIN_BOX_VALUE,
  TokenAmount
} from "@fleet-sdk/core";
import { SByte, SColl, SInt } from "@fleet-sdk/serializer";
import { getTokenPrice, isBabelContractForTokenId, isValidBabelBox } from "./utils";

export function BabelSwapPlugin(babelBox: Box<Amount>, token: TokenAmount<Amount>): FleetPlugin {
  if (!isValidBabelBox(babelBox)) {
    throw new Error("Invalid Babel Box.");
  }

  if (!isBabelContractForTokenId(babelBox.ergoTree, token.tokenId)) {
    throw new Error(
      `The Babel Box '${babelBox.boxId}' is not compatible with Token ID '${token.tokenId}'.`
    );
  }

  const input = new ErgoUnsignedInput(babelBox);
  const changeAmount = input.value - ensureBigInt(token.amount) * getTokenPrice(babelBox);

  if (changeAmount < SAFE_MIN_BOX_VALUE) {
    throw new Error(
      "The selected Babel Box does not have enough ERG to perform a swap for the selected amount of tokens."
    );
  }

  return ({ addInputs, addOutputs }) => {
    const outputsLength = addOutputs(
      new OutputBuilder(changeAmount, input.ergoTree)
        .addTokens(input.assets)
        .addTokens(token)
        .setAdditionalRegisters({
          R4: input.additionalRegisters.R4,
          R5: input.additionalRegisters.R5,
          R6: SColl(SByte, input.boxId).toHex()
        })
    );

    addInputs(
      input.setContextVars({
        0: SInt(outputsLength - 1).toHex()
      })
    );
  };
}
