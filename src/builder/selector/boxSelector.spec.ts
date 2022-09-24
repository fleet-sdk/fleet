import { DuplicateInputSelectionError } from "../../errors/duplicateInputSelectionError";
import { InsufficientInputs } from "../../errors/insufficientInputs";
import { regularBoxesMock } from "../../mocks/mockBoxes";
import { Box } from "../../types";
import { first } from "../../utils/arrayUtils";
import { sumBy } from "../../utils/bigIntUtils";
import { sumByTokenId } from "../../utils/boxUtils";
import { BoxSelector } from "./boxSelector";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";

describe("Selection strategies", () => {
  it("Should use specified selection strategy class implementation", () => {
    class CustomStrategy implements ISelectionStrategy {
      select(inputs: Box<bigint>[]): Box<bigint>[] {
        return inputs;
      }
    }

    const strategy = new CustomStrategy();
    const selectSpy = jest.spyOn(strategy, "select");
    const selector = new BoxSelector(regularBoxesMock, { nanoErgs: 0n }).defineStrategy(strategy);

    expect(selector.select()).toHaveLength(regularBoxesMock.length);
    expect(selectSpy).toBeCalled();
  });

  it("Should use specified selection strategy function", () => {
    const mockSelectorFunction = jest.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });

    const selector = new BoxSelector(regularBoxesMock, { nanoErgs: 0n }).defineStrategy(
      mockSelectorFunction
    );

    expect(selector.select()).toHaveLength(regularBoxesMock.length);
    expect(mockSelectorFunction).toBeCalled();
  });

  it("Should fallback to a default selection strategy if nothing is specified", () => {
    const selection = new BoxSelector(regularBoxesMock, { nanoErgs: 10000n }).select();

    expect(selection.length).toBe(1);
  });
});

describe("Overall selection", () => {
  it("Should select all inputs with a given token if no target amount is specified - multiple tokenIds", () => {
    const selector = new BoxSelector(regularBoxesMock, {
      tokens: [
        { tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283" },
        { tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b" }
      ]
    });

    const boxes = selector.select();

    expect(boxes).toHaveLength(4);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(10000n);
  });

  it("Should select all inputs with nanoErgs if no target amount is specified", () => {
    const selector = new BoxSelector(regularBoxesMock, { nanoErgs: undefined });
    const boxes = selector.select();

    expect(boxes).toHaveLength(regularBoxesMock.length);
  });
});

describe("Inputs sorting", () => {
  it("Should order inputs ascending by boxId", () => {
    const nanoErgs = sumBy(regularBoxesMock, (x) => x.value);
    const selection = new BoxSelector(regularBoxesMock, { nanoErgs })
      .orderBy((x) => x.boxId)
      .select();

    expect(isAscending(selection.map((x) => x.boxId))).toBe(true);
    expect(isAscending(regularBoxesMock.map((x) => x.boxId))).not.toBe(true);
    expect(selection).toHaveLength(regularBoxesMock.length);
  });

  it("Should order inputs descending by ergoTree", () => {
    const nanoErgs = sumBy(regularBoxesMock, (x) => x.value);
    const selection = new BoxSelector(regularBoxesMock, { nanoErgs })
      .orderBy((x) => x.ergoTree, "desc")
      .select();

    expect(isDescending(selection.map((x) => x.ergoTree))).toBe(true);
    expect(isDescending(regularBoxesMock.map((x) => x.ergoTree))).not.toBe(true);
    expect(selection).toHaveLength(regularBoxesMock.length);
  });

  it("Should fallback order to ascending creationHeight if no orderBy is called", () => {
    const nanoErgs = sumBy(regularBoxesMock, (x) => x.value);
    const selection = new BoxSelector(regularBoxesMock, { nanoErgs }).select();

    expect(isAscending(selection.map((x) => x.creationHeight))).toBe(true);
    expect(isAscending(regularBoxesMock.map((x) => x.boxId))).not.toBe(true);
    expect(selection).toHaveLength(regularBoxesMock.length);
  });
});

describe("Ensure input inclusion", () => {
  it("Should forcedly include inputs that attends to filter criteria", () => {
    const arbitraryBoxId = "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d";
    const target = { nanoErgs: 10000n };
    const selector = new BoxSelector(regularBoxesMock, target).ensureInclusion(
      (input) => input.boxId === arbitraryBoxId
    );
    const boxes = selector.select();

    expect(boxes.some((x) => x.boxId === arbitraryBoxId)).toBe(true);
    expect(boxes).toHaveLength(1);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
  });

  it("Should forcedly include inputs that attends to filter criteria and collect additional inputs until target is reached", () => {
    const arbitraryBoxId = "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d";
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const target = { nanoErgs: 10000n, tokens: [{ tokenId, amount: 100n }] };
    const selector = new BoxSelector(regularBoxesMock, target).ensureInclusion(
      (input) => input.boxId === arbitraryBoxId
    );
    const boxes = selector.select();

    expect(boxes.some((x) => x.boxId === arbitraryBoxId)).toBe(true);
    expect(boxes).toHaveLength(2);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
    expect(sumByTokenId(boxes, tokenId)).toBeGreaterThanOrEqual(first(target.tokens).amount);
  });
});

describe("Validations", () => {
  it("Should fail if nanoErgs target is unreached", () => {
    const selector = new BoxSelector(regularBoxesMock, {
      nanoErgs: 9000000000000n
    });

    expect(() => {
      selector.select();
    }).toThrow(InsufficientInputs);
  });

  it("Should fail if tokens target is unreached", () => {
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const selector = new BoxSelector(regularBoxesMock, {
      nanoErgs: 10000n,
      tokens: [{ tokenId, amount: 10000000n }]
    });

    expect(() => {
      selector.select();
    }).toThrow(InsufficientInputs);
  });

  it("Should fail if any target is unreached", () => {
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const selector = new BoxSelector(regularBoxesMock, {
      nanoErgs: 9000000000000n,
      tokens: [{ tokenId, amount: 10000000n }]
    });

    expect(() => {
      selector.select();
    }).toThrow(InsufficientInputs);
  });

  it("Should fail if selector duplicates any item", () => {
    const selector = new BoxSelector(regularBoxesMock, { nanoErgs: 0n }).defineStrategy(
      (inputs) => {
        return inputs.concat(inputs[0]); // duplicates the fist input;
      }
    );

    expect(() => {
      selector.select();
    }).toThrow(DuplicateInputSelectionError);
  });
});

describe("Test helpers", () => {
  it("Should return true with a ascending array", () => {
    expect(isAscending([1, 2, 2, 3, 4, 5])).toBe(true);
  });

  it("Should return true with a descending array", () => {
    expect(isDescending([5, 4, 3, 3, 2, 1])).toBe(true);
  });

  it("Should fail with a out of order array", () => {
    const outOfOrder = [9, 3, 71, 35];

    expect(isAscending(outOfOrder)).toBe(false);
    expect(isDescending(outOfOrder)).toBe(false);
  });
});

function isAscending<T>(arr: T[]) {
  return arr.every((x, i) => {
    return i === 0 || x >= arr[i - 1];
  });
}

function isDescending<T>(arr: T[]) {
  return arr.every((x, i) => {
    return i === 0 || x <= arr[i - 1];
  });
}
