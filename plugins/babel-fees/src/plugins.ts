import { ensureBigInt } from "@fleet-sdk/common";
import {
  Amount,
  Box,
  ErgoUnsignedInput,
  FleetPlugin,
  OutputBuilder,
  SAFE_MIN_BOX_VALUE,
  SByte,
  SColl,
  SConstant,
  SInt,
  TokenAmount
} from "@fleet-sdk/core";
import { getTokenPrice, isBabelContractForTokenId, isValidBabelBox } from "./utils";

export function BabelSwapPlugin(babelBox: Box<Amount>, token: TokenAmount<Amount>): FleetPlugin {
  return ({ addInputs, addOutputs }) => {
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

    const outputsLength = addOutputs(
      new OutputBuilder(changeAmount, input.ergoTree)
        .addTokens(input.assets)
        .addTokens(token)
        .setAdditionalRegisters({
          R4: input.additionalRegisters.R4,
          R5: input.additionalRegisters.R5,
          R6: SConstant(SColl(SByte, input.boxId))
        })
    );

    addInputs(
      input.setContextVars({
        0: SConstant(SInt(outputsLength - 1))
      })
    );
  };
}
