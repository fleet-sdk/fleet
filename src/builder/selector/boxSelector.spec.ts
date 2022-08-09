import { mockUnspentBoxes } from "../../mocks/mockBoxes";
import { Box } from "../../types";
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
    const selector = new BoxSelector(mockUnspentBoxes).defineStrategy(strategy);

    expect(selector.select()).toHaveLength(mockUnspentBoxes.length);
    expect(selectSpy).toBeCalled();
  });

  it("Should use specified selection strategy function", () => {
    const mockSelectorFunction = jest.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });

    const selector = new BoxSelector(mockUnspentBoxes).defineStrategy(mockSelectorFunction);

    expect(selector.select()).toHaveLength(mockUnspentBoxes.length);
    expect(mockSelectorFunction).toBeCalled();
  });

  it("Should fallback to a default selection strategy if nothing is specified", () => {
    const selection = new BoxSelector(mockUnspentBoxes).select();

    expect(selection?.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Inputs sorting", () => {
  it("Should order inputs ascending by boxId", () => {
    const selection = new BoxSelector(mockUnspentBoxes).orderBy((x) => x.boxId).select();

    expect(isAscending(selection.map((x) => x.boxId))).toBe(true);
    expect(isAscending(mockUnspentBoxes.map((x) => x.boxId))).not.toBe(true);
    expect(selection).toHaveLength(mockUnspentBoxes.length);
  });

  it("Should order inputs descending by ergoTree", () => {
    const selection = new BoxSelector(mockUnspentBoxes).orderBy((x) => x.ergoTree, "desc").select();

    expect(isDescending(selection.map((x) => x.ergoTree))).toBe(true);
    expect(isDescending(mockUnspentBoxes.map((x) => x.ergoTree))).not.toBe(true);
    expect(selection).toHaveLength(mockUnspentBoxes.length);
  });

  it("Should fallback order to ascending creationHeight if no orderBy is called", () => {
    const selection = new BoxSelector(mockUnspentBoxes).select();

    expect(isAscending(selection.map((x) => x.creationHeight))).toBe(true);
    expect(isAscending(mockUnspentBoxes.map((x) => x.boxId))).not.toBe(true);
    expect(selection).toHaveLength(mockUnspentBoxes.length);
  });
});

describe("Testing helpers", () => {
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
