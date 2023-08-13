import { fail } from "assert";
import { ensureBigInt, first } from "@fleet-sdk/common";
import { TransactionBuilder } from "@fleet-sdk/core";
import { parse, SByte, SColl } from "@fleet-sdk/serializer";
import { regularBoxes } from "_test-vectors";
import { babelBoxesMock } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { BabelSwapPlugin } from "./plugins";
import { getTokenPrice, isValidBabelBox, isValidBabelContract } from "./utils";

describe("Babel Swap Plugin", () => {
  const height = 895586;
  const changeAddress = "9hY16vzHmmfyVBwKeFGHvb2bMFsG94A1u7To1QWtUokACyFVENQ";

  it("Should add babel input and output", () => {
    const babelBox = first(babelBoxesMock);
    const payingTokenAmount = 5n;

    const tx = new TransactionBuilder(height)
      .from(regularBoxes)
      .extend(
        BabelSwapPlugin(babelBox, {
          tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
          amount: payingTokenAmount
        })
      )
      .payMinFee()
      .sendChangeTo(changeAddress)
      .build()
      .toEIP12Object();

    const input = tx.inputs.find((box) => isValidBabelBox(box));
    if (!input || !input.extension[0]) {
      fail();
    }

    const outputIndex = parse<number>(input.extension[0]);
    const output = tx.outputs[outputIndex];
    expect(isValidBabelContract(output.ergoTree)).toBeTruthy();
    expect(output.ergoTree).toBe(input.ergoTree);
    expect(output.additionalRegisters.R4).toBe(input.additionalRegisters.R4);
    expect(output.additionalRegisters.R5).toBe(input.additionalRegisters.R5);
    expect(output.additionalRegisters.R6).toBe(SColl(SByte, input.boxId).toHex());

    const swappedNanoErgs = getTokenPrice(input) * payingTokenAmount;
    expect(ensureBigInt(input.value)).toBe(BigInt(output.value) + swappedNanoErgs);
    expect(first(input.assets)).toEqual({
      tokenId: first(output.assets).tokenId,
      amount: (ensureBigInt(first(output.assets).amount) - payingTokenAmount).toString()
    });
  });

  it("Should fail if invalid babel box is added", () => {
    const nonBabelBox = regularBoxes[1];

    expect(() => {
      new TransactionBuilder(height)
        .from(regularBoxes[0])
        .extend(
          BabelSwapPlugin(nonBabelBox, {
            tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
            amount: 1n
          })
        )
        .payMinFee()
        .sendChangeTo(changeAddress)
        .build();
    }).toThrow();
  });

  it("Should fail if valid babel box is added but incompatible tokenId", () => {
    const babelBox = first(babelBoxesMock);

    expect(() => {
      new TransactionBuilder(height)
        .from(regularBoxes)
        .extend(
          BabelSwapPlugin(babelBox, {
            tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            amount: 10n
          })
        )
        .payMinFee()
        .sendChangeTo(changeAddress)
        .build();
    }).toThrow();
  });

  it("Should fail if the box does not have enough ERG to swap for the tokens", () => {
    const babelBox = first(babelBoxesMock);

    expect(() => {
      new TransactionBuilder(height)
        .from(regularBoxes)
        .extend(
          BabelSwapPlugin(babelBox, {
            tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
            amount: "10000000"
          })
        )
        .payMinFee()
        .sendChangeTo(changeAddress)
        .build();
    }).toThrow();
  });
});
