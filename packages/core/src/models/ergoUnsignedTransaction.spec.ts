import { serializeTransaction } from "@fleet-sdk/serializer";
import { regularBoxes } from "_test-vectors";
import { mockedUnsignedTransactions } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { OutputBuilder, SAFE_MIN_BOX_VALUE, TransactionBuilder } from "../builder";
import { ErgoUnsignedInput } from "./ergoUnsignedInput";
import { ErgoUnsignedTransaction } from "./ergoUnsignedTransaction";

describe("ErgoUnsignedTransaction model", () => {
  it("Should generate the right transactionId", () => {
    for (const tx of mockedUnsignedTransactions) {
      const unsigned = new ErgoUnsignedTransaction(
        tx.inputs.map((input) => new ErgoUnsignedInput(input)),
        tx.dataInputs.map((dataInput) => new ErgoUnsignedInput(dataInput)),
        tx.outputs.map((output) => ({
          ...output,
          value: BigInt(output.value),
          assets: output.assets.map((token) => ({
            tokenId: token.tokenId,
            amount: BigInt(token.amount)
          }))
        }))
      );

      expect(unsigned.id).toBe(tx.id);
    }
  });

  it("Should serialize", () => {
    for (const tx of mockedUnsignedTransactions) {
      const unsigned = new ErgoUnsignedTransaction(
        tx.inputs.map((input) => new ErgoUnsignedInput(input)),
        tx.dataInputs.map((dataInput) => new ErgoUnsignedInput(dataInput)),
        tx.outputs.map((output) => ({
          ...output,
          value: BigInt(output.value),
          assets: output.assets.map((token) => ({
            tokenId: token.tokenId,
            amount: BigInt(token.amount)
          }))
        }))
      );

      expect(unsigned.toBytes()).toEqual(serializeTransaction(tx).toBytes());
    }
  });

  it("Should convert to plain object", () => {
    const transaction = new TransactionBuilder(1)
      .from(regularBoxes)
      .withDataFrom(regularBoxes[0])
      .to(
        new OutputBuilder(
          SAFE_MIN_BOX_VALUE,
          "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
        )
      )
      .payMinFee()
      .sendChangeTo("9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")
      .build();

    const plainObject = transaction.toPlainObject();

    expect(transaction.inputs.map((x) => x.boxId)).toEqual(
      plainObject.inputs.map((x) => x.boxId)
    );
    expect(transaction.dataInputs.map((x) => x.boxId)).toEqual(
      plainObject.dataInputs.map((x) => x.boxId)
    );
    expect(transaction.outputs.map((x) => x.ergoTree)).toEqual(
      plainObject.outputs.map((x) => x.ergoTree)
    );
  });

  it("Should calculate burning amount", () => {
    const tokensToBurn = [
      {
        tokenId: "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489",
        amount: 10n
      },
      {
        tokenId: "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5",
        amount: 20n
      }
    ];

    const transaction = new TransactionBuilder(1)
      .from(regularBoxes)
      .burnTokens(tokensToBurn)
      .payMinFee()
      .sendChangeTo("9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")
      .build();

    expect(transaction.burning).toEqual({ nanoErgs: 0n, tokens: tokensToBurn });
  });
});
