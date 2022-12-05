import { regularBoxesMock } from "../tests/mocks/mockBoxes";
import { sumBy } from "./bigIntUtils";
import { areRegistersDenselyPacked, utxoSum } from "./boxUtils";

describe("UTxo sum", () => {
  it("Should sum correctly by token id", () => {
    const inputs = regularBoxesMock.filter((input) =>
      [
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d",
        "467b6867c6726cc5484be3cbddbf55c30c0a71594a20c1ac28d35b5049632444",
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
      ].includes(input.boxId)
    );

    expect(
      utxoSum(inputs, "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")
    ).toBe(3819n);
  });

  it("Should return zero for empty arrays", () => {
    expect(utxoSum([], "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")).toBe(
      0n
    );
  });

  it("Should sum all tokens and nanoErgs", () => {
    const boxes = regularBoxesMock.filter((input) =>
      [
        "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
        "a2c9821f5c2df9c320f17136f043b33f7716713ab74c84d687885f9dd39d2c8a",
        "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52",
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
      ].includes(input.boxId)
    );

    expect(utxoSum(boxes)).toEqual({
      nanoErgs: sumBy(boxes, (x) => x.value),
      tokens: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 226652336n
        },
        {
          tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
          amount: 10n
        }
      ]
    });
  });

  it("Should sum only nanoErgs", () => {
    const boxes = regularBoxesMock.filter((input) =>
      [
        "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
        "a2c9821f5c2df9c320f17136f043b33f7716713ab74c84d687885f9dd39d2c8a",
        "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52",
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
      ].includes(input.boxId)
    );

    expect(utxoSum(boxes, "nanoErgs")).toEqual(sumBy(boxes, (x) => x.value));
  });

  it("Should sum if box doesn't contains tokens", () => {
    const boxes = regularBoxesMock.filter((input) =>
      [
        "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
        "30cb07d93f16f5b052e9f56c1b5dfb83db9ccaeb467dde064933afc23beb6f5f"
      ].includes(input.boxId)
    );

    expect(utxoSum(boxes)).toEqual({
      nanoErgs: sumBy(boxes, (x) => x.value),
      tokens: []
    });
  });
});

describe("Densely pack check - areRegistersDenselyPacked()", () => {
  it("Should pass for VALID registers packing", () => {
    expect(
      areRegistersDenselyPacked({
        R4: "0580c0fc82aa02"
      })
    ).toBeTruthy();

    expect(
      areRegistersDenselyPacked({
        R4: "0580c0fc82aa02",
        R5: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
      })
    ).toBeTruthy();

    expect(
      areRegistersDenselyPacked({
        R4: "0580c0fc82aa02",
        R5: "0580c0fc82aa02",
        R6: "0580c0fc82aa02",
        R7: "0580c0fc82aa02",
        R8: "0580c0fc82aa02",
        R9: "0580c0fc82aa02"
      })
    ).toBeTruthy();
  });

  it("Should fail for INVALID registers packing", () => {
    // R4 not included
    expect(
      areRegistersDenselyPacked({
        R5: "0580c0fc82aa02"
      })
    ).toBeFalsy();

    // R5 not included
    expect(
      areRegistersDenselyPacked({
        R4: "0580c0fc82aa02",
        R6: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
      })
    ).toBeFalsy();

    // R4, R5 and R6 not included
    expect(
      areRegistersDenselyPacked({
        R7: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
      })
    ).toBeFalsy();

    // R5, R6, R7 and R8 not included
    expect(
      areRegistersDenselyPacked({
        R4: "0580c0fc82aa02",
        R9: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
      })
    ).toBeFalsy();
  });
});
