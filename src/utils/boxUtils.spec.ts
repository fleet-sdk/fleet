import { regularBoxesMock } from "../mocks/mockBoxes";
import { areRegistersDenselyPacked, sumByTokenId } from "./boxUtils";

describe("Box sumByTokenId", () => {
  it("Should sum correctly", () => {
    const inputs = regularBoxesMock.filter((input) =>
      [
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d",
        "467b6867c6726cc5484be3cbddbf55c30c0a71594a20c1ac28d35b5049632444",
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
      ].includes(input.boxId)
    );

    expect(
      sumByTokenId(inputs, "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")
    ).toBe(3819n);
  });

  it("Should return zero for empty arrays", () => {
    expect(
      sumByTokenId([], "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")
    ).toBe(0n);
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
