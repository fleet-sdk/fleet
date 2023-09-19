import { SignedTransaction as gqlSignedTransaction } from "@ergo-graphql/types";
import { SignedTransaction } from "@fleet-sdk/common";

export const castSignedTxToGql = (transaction: SignedTransaction): gqlSignedTransaction => {
  return {
    id: transaction.id,
    inputs: transaction.inputs.map((input) => ({
      boxId: input.boxId,
      spendingProof: {
        proofBytes: input.spendingProof.proofBytes,
        extension: input.spendingProof.extension
      }
    })),
    dataInputs: transaction.dataInputs.map((input) => ({
      boxId: input.boxId
    })),
    outputs: transaction.outputs.map((output) => ({
      boxId: output.boxId,
      value: output.value.toString(),
      ergoTree: output.ergoTree,
      creationHeight: output.creationHeight,
      assets: output.assets.map((asset) => ({
        tokenId: asset.tokenId,
        amount: asset.amount.toString()
      })),
      additionalRegisters: output.additionalRegisters
    }))
  };
};
