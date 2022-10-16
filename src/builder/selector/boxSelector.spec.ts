import { DuplicateInputSelectionError } from "../../errors/duplicateInputSelectionError";
import { InsufficientInputs } from "../../errors/insufficientInputs";
import { regularBoxesMock } from "../../mocks/mockBoxes";
import { Box } from "../../types";
import { first } from "../../utils/arrayUtils";
import { sumBy } from "../../utils/bigIntUtils";
import { sumByTokenId } from "../../utils/boxUtils";
import { SAFE_MIN_BOX_VALUE } from "../outputBuilder";
import { BoxSelector } from "./boxSelector";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";

describe("Construction", () => {
  it("Should construct with an array of inputs", () => {
    const selector = new BoxSelector(regularBoxesMock);
    expect(selector.select({ nanoErgs: undefined })).toHaveLength(regularBoxesMock.length);
  });
});

describe("Selection strategies", () => {
  it("Should use specified selection strategy class implementation", () => {
    class CustomStrategy implements ISelectionStrategy {
      select(inputs: Box<bigint>[]): Box<bigint>[] {
        return inputs;
      }
    }

    const strategy = new CustomStrategy();
    const selectSpy = jest.spyOn(strategy, "select");
    const selector = new BoxSelector(regularBoxesMock).defineStrategy(strategy);

    expect(selector.select({ nanoErgs: 0n })).toHaveLength(regularBoxesMock.length);
    expect(selectSpy).toBeCalled();
  });

  it("Should use specified selection strategy function", () => {
    const mockSelectorFunction = jest.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });

    const selector = new BoxSelector(regularBoxesMock).defineStrategy(mockSelectorFunction);

    expect(selector.select({ nanoErgs: 0n })).toHaveLength(regularBoxesMock.length);
    expect(mockSelectorFunction).toBeCalled();
  });

  it("Should fallback to a default selection strategy if nothing is specified", () => {
    const selection = new BoxSelector(regularBoxesMock).select({ nanoErgs: 10000n });

    expect(selection.length).toBe(1);
  });
});

describe("Overall selection", () => {
  it("Should select all inputs with a given token if no target amount is specified - multiple tokenIds", () => {
    const selector = new BoxSelector(regularBoxesMock);

    const boxes = selector.select({
      tokens: [
        { tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283" },
        { tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b" }
      ]
    });

    expect(boxes).toHaveLength(4);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(10000n);
  });

  it("Should select all inputs with nanoErgs if no target amount is specified", () => {
    const selector = new BoxSelector(regularBoxesMock);
    const boxes = selector.select({ nanoErgs: undefined });

    expect(boxes).toHaveLength(regularBoxesMock.length);
  });

  it("Should not change target object", () => {
    const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
    const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";
    const target = {
      nanoErgs: SAFE_MIN_BOX_VALUE,
      tokens: [
        { tokenId: tokenA, amount: 100n },
        { tokenId: tokenB, amount: 1n }
      ]
    };

    new BoxSelector(regularBoxesMock).select(target);

    expect(target).toEqual({
      nanoErgs: SAFE_MIN_BOX_VALUE,
      tokens: [
        { tokenId: tokenA, amount: 100n },
        { tokenId: tokenB, amount: 1n }
      ]
    });
  });
});

describe("Inputs sorting", () => {
  it("Should order inputs ascending by boxId", () => {
    const nanoErgs = sumBy(regularBoxesMock, (x) => x.value);
    const selection = new BoxSelector(regularBoxesMock)
      .orderBy((x) => x.boxId)
      .select({ nanoErgs });

    expect(isAscending(selection.map((x) => x.boxId))).toBe(true);
    expect(isAscending(regularBoxesMock.map((x) => x.boxId))).not.toBe(true);
    expect(selection).toHaveLength(regularBoxesMock.length);
  });

  it("Should order inputs descending by ergoTree", () => {
    const nanoErgs = sumBy(regularBoxesMock, (x) => x.value);
    const selection = new BoxSelector(regularBoxesMock)
      .orderBy((x) => x.ergoTree, "desc")
      .select({ nanoErgs });

    expect(isDescending(selection.map((x) => x.ergoTree))).toBe(true);
    expect(isDescending(regularBoxesMock.map((x) => x.ergoTree))).not.toBe(true);
    expect(selection).toHaveLength(regularBoxesMock.length);
  });

  it("Should fallback order to ascending creationHeight if no orderBy is called", () => {
    const nanoErgs = sumBy(regularBoxesMock, (x) => x.value);
    const selection = new BoxSelector(regularBoxesMock).select({ nanoErgs });

    expect(isAscending(selection.map((x) => x.creationHeight))).toBe(true);
    expect(isAscending(regularBoxesMock.map((x) => x.boxId))).not.toBe(true);
    expect(selection).toHaveLength(regularBoxesMock.length);
  });
});

describe("Ensure input inclusion", () => {
  it("Should forcedly include inputs that attends to filter criteria", () => {
    const arbitraryBoxId = "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d";
    const target = { nanoErgs: 10000n };
    const selector = new BoxSelector(regularBoxesMock).ensureInclusion(
      (input) => input.boxId === arbitraryBoxId
    );
    const boxes = selector.select(target);

    expect(boxes.some((x) => x.boxId === arbitraryBoxId)).toBe(true);
    expect(boxes).toHaveLength(1);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
  });

  it("Should forcedly include inputs that attends to filter criteria and collect additional inputs until target is reached", () => {
    const arbitraryBoxId = "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d";
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const target = { nanoErgs: 10000n, tokens: [{ tokenId, amount: 100n }] };
    const selector = new BoxSelector(regularBoxesMock).ensureInclusion(
      (input) => input.boxId === arbitraryBoxId
    );
    const boxes = selector.select(target);

    expect(boxes.some((x) => x.boxId === arbitraryBoxId)).toBe(true);
    expect(boxes).toHaveLength(2);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
    expect(sumByTokenId(boxes, tokenId)).toBeGreaterThanOrEqual(first(target.tokens).amount);
  });
});

describe("Validations", () => {
  it("Should fail if nanoErgs target is unreached", () => {
    const selector = new BoxSelector(regularBoxesMock);

    expect(() => {
      selector.select({
        nanoErgs: 9000000000000n
      });
    }).toThrow(InsufficientInputs);
  });

  it("Should fail if tokens target is unreached", () => {
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const selector = new BoxSelector(regularBoxesMock);

    expect(() => {
      selector.select({
        nanoErgs: 10000n,
        tokens: [{ tokenId, amount: 10000000n }]
      });
    }).toThrow(InsufficientInputs);
  });

  it("Should fail if any target is unreached", () => {
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const selector = new BoxSelector(regularBoxesMock);

    expect(() => {
      selector.select({
        nanoErgs: 9000000000000n,
        tokens: [{ tokenId, amount: 10000000n }]
      });
    }).toThrow(InsufficientInputs);
  });

  it("Should fail if selector duplicates any item", () => {
    const selector = new BoxSelector(regularBoxesMock).defineStrategy((inputs) => {
      return inputs.concat(inputs[0]); // duplicates the fist input;
    });

    expect(() => {
      selector.select({ nanoErgs: 0n });
    }).toThrow(DuplicateInputSelectionError);
  });
});

describe("Target builder", () => {
  it("Should sum all boxes values and create a target with no tokens", () => {
    const target = BoxSelector.buildTargetFrom([first(regularBoxesMock)]);
    expect(target).toEqual({ nanoErgs: first(regularBoxesMock).value, tokens: [] });
  });

  it("Should sum all boxes values and tokens", () => {
    const mockBoxes = [
      {
        value: 67500000000n,
        ergoTree:
          "100204a00b08cd021dde34603426402615658f1d970cfa7c7bd92ac81a8b16eeebff264d59ce4604ea02d192a39a8cc7a70173007301",
        assets: [
          {
            tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
            amount: "100"
          },
          {
            tokenId: "5a34d53ca483924b9a6aa0c771f11888881b516a8d1a9cdc535d063fe26d065e",
            amount: 33n
          },
          {
            tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2",
            amount: 1n
          }
        ],
        creationHeight: 284761,
        additionalRegisters: {},
        transactionId: "9148408c04c2e38a6402a7950d6157730fa7d49e9ab3b9cadec481d7769918e9",
        index: 1
      },
      {
        boxId: "a2c9821f5c2df9c320f17136f043b33f7716713ab74c84d687885f9dd39d2c8a",
        value: "1000000",
        index: 0,
        transactionId: "f82fa15166d787c275a6a5ab29983f6386571c63e50c73c1af7cba184f85ef23",
        creationHeight: 805063,
        ergoTree:
          "1012040204000404040004020406040c0408040a050004000402040204000400040404000400d812d601b2a4730000d602e4c6a7050ed603b2db6308a7730100d6048c720302d605db6903db6503fed606e4c6a70411d6079d997205b27206730200b27206730300d608b27206730400d609b27206730500d60a9972097204d60b95917205b272067306009d9c7209b27206730700b272067308007309d60c959272077208997209720a999a9d9c7207997209720b7208720b720ad60d937204720cd60e95720db2a5730a00b2a5730b00d60fdb6308720ed610b2720f730c00d6118c720301d612b2a5730d00d1eded96830201aedb63087201d901134d0e938c721301720293c5b2a4730e00c5a79683050193c2720ec2720193b1720f730f938cb2720f731000017202938c7210017211938c721002720cec720dd801d613b2db630872127311009683060193c17212c1a793c27212c2a7938c7213017211938c721302997204720c93e4c67212050e720293e4c6721204117206",
        assets: [
          {
            tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
            amount: 226642336n
          }
        ],
        additionalRegisters: {}
      }
    ];

    const target = BoxSelector.buildTargetFrom(mockBoxes);
    expect(target).toEqual({
      nanoErgs: 67501000000n,
      tokens: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 226642436n
        },
        {
          tokenId: "5a34d53ca483924b9a6aa0c771f11888881b516a8d1a9cdc535d063fe26d065e",
          amount: 33n
        },
        {
          tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2",
          amount: 1n
        }
      ]
    });
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
