import { regularBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { hasDuplicatesBy, uniq } from "./array";
import { isEmpty } from "./assertions";
import { sumBy } from "./bigInt";
import {
  areRegistersDenselyPacked,
  BoxSummary,
  ensureUTxOBigInt,
  utxoDiff,
  utxoFilter,
  utxoSum
} from "./utxo";

describe("UTxO sum", () => {
  it("Should sum correctly by token id", () => {
    const inputs = regularBoxes.filter((input) =>
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

  it("Should not return undefined results for empty arrays", () => {
    expect(utxoSum([], "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")).toBe(
      0n
    );

    expect(utxoSum([]).nanoErgs).toBe(0n);
    expect(utxoSum([]).tokens).toStrictEqual([]);
  });

  it("Should sum all tokens and nanoErgs", () => {
    const boxes = regularBoxes.filter((input) =>
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
    const boxes = regularBoxes.filter((input) =>
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
    const boxes = regularBoxes.filter((input) =>
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

describe("utxoDiff()", () => {
  it("Should calculate the difference between two summaries", () => {
    const sumA: BoxSummary = {
      nanoErgs: 100n,
      tokens: [
        { tokenId: "token_id_1", amount: 5n },
        { tokenId: "token_id_2", amount: 875n },
        { tokenId: "token_id_3", amount: 100n },
        { tokenId: "token_id_4", amount: 200n }
      ]
    };

    const sumB: BoxSummary = {
      nanoErgs: 10n,
      tokens: [
        { tokenId: "token_id_1", amount: 2n },
        { tokenId: "token_id_2", amount: 880n },
        { tokenId: "token_id_3", amount: 100n }
      ]
    };

    expect(utxoDiff(sumA, sumB)).toEqual({
      nanoErgs: 90n,
      tokens: [
        { tokenId: "token_id_1", amount: 3n },
        { tokenId: "token_id_2", amount: -5n },
        { tokenId: "token_id_4", amount: 200n }
      ]
    });

    expect(utxoDiff(sumA, sumA)).toEqual({
      nanoErgs: 0n,
      tokens: []
    });
  });

  it("Should calculate the difference between two box arrays", () => {
    const boxes1 = regularBoxes;
    const boxes2 = regularBoxes.slice(1);
    const diff = utxoDiff(boxes1, boxes2);

    expect(diff.nanoErgs).to.be.equal(regularBoxes[0].value);
    expect(diff.tokens).to.be.deep.equal(regularBoxes[0].assets);
  });

  it("Should calculate the difference between a box array and a summary", () => {
    const summary = utxoSum(regularBoxes);
    const boxes = regularBoxes.slice(0, -1);
    const diff = utxoDiff(summary, boxes);

    expect(diff.nanoErgs).to.be.equal(regularBoxes[5].value);
    expect(diff.tokens).to.be.deep.equal(regularBoxes[5].assets);
    expect(utxoDiff(regularBoxes, summary)).to.be.deep.equal({ nanoErgs: 0n, tokens: [] });
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

    // R5 explicitly set to undefined
    expect(
      areRegistersDenselyPacked({
        R4: "0580c0fc82aa02",
        R5: undefined,
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

describe("UTxO filter", () => {
  it("Should filter by max UTxO count", () => {
    expect(utxoFilter(regularBoxes, { max: { count: 2 } })).to.has.length(2);
    expect(utxoFilter(regularBoxes, { max: { count: regularBoxes.length } })).to.has.length(
      regularBoxes.length
    );
  });

  it("Should filter by max distinct tokens count", () => {
    const filtered = utxoFilter(regularBoxes, { max: { aggregatedDistinctTokens: 3 } });

    expect(filtered).to.have.length(5);
    expect(filtered.some((x) => isEmpty(x.assets))).to.be.true;
    expect(hasDuplicatesBy(filtered, (x) => x.boxId)).to.be.false;
    expect(
      uniq(filtered.flatMap((x) => x.assets.map((x) => x.tokenId)))
    ).to.has.length.lessThanOrEqual(3);
  });

  it("Should filter by predicate", () => {
    const filtered = utxoFilter(regularBoxes, { by: (box) => isEmpty(box.assets) });

    expect(filtered).to.have.length(2);
    expect(filtered.every((x) => isEmpty(x.assets))).to.be.true;
    expect(hasDuplicatesBy(filtered, (x) => x.boxId)).to.be.false;
  });

  it("Should filter by max distinct tokens and UTxO count", () => {
    const filter = {
      max: {
        count: 2,
        aggregatedDistinctTokens: 3
      }
    };

    const filtered = utxoFilter(regularBoxes, filter);

    expect(filtered).to.have.length(filter.max.count);
    expect(hasDuplicatesBy(filtered, (x) => x.boxId)).to.be.false;
    expect(
      uniq(filtered.flatMap((x) => x.assets.map((x) => x.tokenId)))
    ).to.has.length.lessThanOrEqual(filter.max.aggregatedDistinctTokens);
  });

  it("Should filter by predicate, max distinct tokens and UTxO count", () => {
    const filtered = utxoFilter(regularBoxes, {
      by: (box) => box.value > 1000000n,
      max: {
        count: 10,
        aggregatedDistinctTokens: 2
      }
    });

    expect(filtered).to.have.length(3);
    expect(filtered.some((x) => x.value <= 1000000n)).to.be.false;
    expect(hasDuplicatesBy(filtered, (x) => x.boxId)).to.be.false;
    expect(
      uniq(filtered.flatMap((x) => x.assets.map((x) => x.tokenId)))
    ).to.has.length.lessThanOrEqual(2);
  });

  it("Should should return empty array for empty inputs and non-matching filters", () => {
    expect(utxoFilter(regularBoxes, { by: (box) => box.value === 0n })).to.be.empty;
    expect(utxoFilter([], { max: { count: 10 } })).to.be.empty;
  });
});

describe("ensureUTxOBigInt()", () => {
  it("Shoudl bigint value properties for nanoergs and tokens", () => {
    const stringAmountsUTxO = {
      boxId: "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52",
      transactionId: "22525acc8b9438ded1e0fef41bb38ac57b8be23c650c82dd8ba545ccdc0b97c2",
      index: 0,
      ergoTree: "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
      creationHeight: 804138,
      value: "1000000",
      assets: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: "10000"
        }
      ],
      additionalRegisters: {}
    };

    const bigIntAmountsUTxO = {
      boxId: "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52",
      transactionId: "22525acc8b9438ded1e0fef41bb38ac57b8be23c650c82dd8ba545ccdc0b97c2",
      index: 0,
      ergoTree: "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
      creationHeight: 804138,
      value: 1000000n,
      assets: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 10000n
        }
      ],
      additionalRegisters: {}
    };

    expect(ensureUTxOBigInt(stringAmountsUTxO)).to.be.deep.equal(bigIntAmountsUTxO);
    expect(ensureUTxOBigInt(bigIntAmountsUTxO)).to.be.deep.equal(bigIntAmountsUTxO);
  });
});
