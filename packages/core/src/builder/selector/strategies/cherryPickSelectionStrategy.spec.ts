import { sumBy, utxoSum } from "@fleet-sdk/common";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { CherryPickSelectionStrategy } from "./cherryPickSelectionStrategy";

describe("Cherry Pick selection strategy", () => {
  it("Should return an empty array if empty target: { nanoErgs: 0 }", () => {
    const selector = new CherryPickSelectionStrategy();
    expect(selector.select(regularBoxes, { nanoErgs: 0n })).toEqual([]);
  });

  it("Should select only one input with no tokens in the input", () => {
    const selector = new CherryPickSelectionStrategy();
    const target = { nanoErgs: 10000n };
    const inputs = selector.select(regularBoxes, target);

    expect(inputs).toHaveLength(1);

    const [input] = inputs;
    expect(input.assets).toHaveLength(0);
    expect(input.value).toBeGreaterThanOrEqual(target.nanoErgs);
  });

  it("Should select two inputs with no tokens in any of the selected inputs", () => {
    const selector = new CherryPickSelectionStrategy();
    const target = { nanoErgs: 67500000000n + 100000000n };
    const inputs = selector.select(regularBoxes, target);

    expect(inputs).toHaveLength(2);

    const [inputOne, inputTwo] = inputs;
    expect(inputOne.assets).toHaveLength(0);
    expect(inputTwo.assets).toHaveLength(0);
  });

  it("Should select all inputs with nanoErgs if no target amount is specified", () => {
    const selector = new CherryPickSelectionStrategy();
    const boxes = selector.select(regularBoxes, { nanoErgs: undefined });

    expect(boxes).toHaveLength(regularBoxes.length);
  });

  it("Should select all inputs with a given token if no target amount is specified", () => {
    const selector = new CherryPickSelectionStrategy();
    const boxes = selector.select(regularBoxes, {
      tokens: [{ tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283" }]
    });

    expect(boxes).toHaveLength(3);
  });

  it("Should select all inputs with a given token if no target amount is specified - multiple tokenIds", () => {
    const selector = new CherryPickSelectionStrategy();
    const target = {
      tokens: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 100n
        },
        {
          tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
          amount: 10n
        }
      ]
    };

    const inputs = selector.select(regularBoxes, target);

    expect(inputs).toHaveLength(2);

    const [inputOne, inputTwo] = inputs;
    expect(inputOne.assets).toHaveLength(1);
    expect(inputTwo.assets).toHaveLength(1);
    for (const t of target.tokens) {
      expect(utxoSum(inputs, t.tokenId)).toBeGreaterThanOrEqual(t.amount);
    }
  });

  it("Should select inputs for tokens and nanoErgs", () => {
    const selector = new CherryPickSelectionStrategy();
    const target = {
      nanoErgs: 10000000000n,
      tokens: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 100n
        },
        {
          tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
          amount: 10n
        }
      ]
    };

    const inputs = selector.select(regularBoxes, target);

    expect(inputs).toHaveLength(3);

    const [inputOne, inputTwo, inputTree] = inputs;
    expect(inputOne.assets).toHaveLength(1);
    expect(inputOne.value);
    expect(inputTwo.assets).toHaveLength(1);
    expect(inputTree.assets).toHaveLength(0);

    expect(sumBy(inputs, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
    for (const t of target.tokens) {
      expect(utxoSum(inputs, t.tokenId)).toBeGreaterThanOrEqual(t.amount);
    }
  });
});
