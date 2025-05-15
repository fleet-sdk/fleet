import { type Box, byteSizeOf, ensureBigInt, first } from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { manyTokensBoxes, regularBoxes, validBoxes } from "_test-vectors";
import { mockUTxO } from "packages/mock-chain/src";
import { describe, expect, it, test } from "vitest";
import { boxVectors, deserializationTestVectors } from "../_test-vectors/boxVectors";
import { SigmaByteReader } from "../coders";
import { deserializeBox, estimateBoxSize, serializeBox } from "./boxSerializer";

describe("ErgoBox serialization", () => {
  it.each(boxVectors)("Should serialize [$json.boxId]", (tv) => {
    expect(serializeBox(tv.json).encode(hex)).toBe(tv.hex);
  });

  it("Should fail with BoxCandidate without distinct tokens list", () => {
    expect(() => {
      serializeBox({
        boxId: "8f281813a88e3016d0e0e7b83c5917931f63b610e4dc9af84ad1adecae50778d",
        value: 14996250000n,
        creationHeight: 852571,
        ergoTree:
          "1014040004000e208c27dd9d8a35aac1e3167d58858c0a8b4059b277da790552e37eba22df9b903504000400040204020101040205a0c21e040204080500040c040204a0c21e0402050a05c8010402d806d601b2a5730000d602b5db6501fed9010263ed93e4c67202050ec5a7938cb2db63087202730100017302d603b17202d604e4c6b272027303000605d605d90105049590720573047204e4c6b272029972057305000605d606b07202860273067307d901063c400163d803d6088c720601d6098c720801d60a8c72060286029a72097308ededed8c72080293c2b2a5720900d0cde4c6720a040792c1b2a5720900730992da720501997209730ae4c6720a0605ea02d1ededededededed93cbc27201e4c6a7060e927203730b93db63087201db6308a793e4c6720104059db07202730cd9010741639a8c720701e4c68c72070206057e72030593e4c6720105049ae4c6a70504730d92c1720199c1a77e9c9a7203730e730f058c72060292da720501998c72060173109972049d9c720473117312b2ad7202d9010763cde4c672070407e4c6b2a5731300040400",
        assets: [
          {
            tokenId: "011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f",
            amount: 1n
          }
        ],
        additionalRegisters: {
          R4: "05cab4cd9a03",
          R5: "04bc8968",
          R6: "0e20f7ef73c4a4ab91b84bb0a2905108d534114472ec057be3a57a9dfc9b1fbd85c1"
        }
      } as unknown as Box<string>);
    }).toThrow();
  });

  it("Should estimate the box size in bytes", () => {
    for (const tv of boxVectors) {
      expect(estimateBoxSize(tv.json)).toBe(byteSizeOf(tv.hex));
    }

    for (const box of regularBoxes) {
      expect(estimateBoxSize(box)).toBe(serializeBox(box).length);
    }

    for (const box of manyTokensBoxes) {
      expect(estimateBoxSize(box)).toBe(serializeBox(box).length);
    }

    for (const box of validBoxes) {
      expect(estimateBoxSize(box)).toBe(serializeBox(box).length);
    }
  });

  it("Should estimate the box size in bytes with custom value", () => {
    for (const tv of boxVectors) {
      expect(estimateBoxSize(tv.json, ensureBigInt(tv.json.value) * 4n)).toBeGreaterThan(
        byteSizeOf(tv.hex)
      );
    }
  });

  it("Should estimate box candidate", () => {
    const output = {
      ergoTree: "deadbeef",
      assets: [],
      creationHeight: 1,
      additionalRegisters: {},
      value: 100000000n
    };

    expect(estimateBoxSize(output)).to.be.equal(46);
  });

  it("Should fail if creation height is undefined", () => {
    const output = {
      ...first(boxVectors).json,
      creationHeight: undefined as unknown as number
    };

    expect(() => estimateBoxSize(output)).toThrow();
  });

  test.each(deserializationTestVectors)("roundtrip box serialization, case: $name", ({ box }) => {
    const serialized = serializeBox(box).toBytes();
    const deserialized = deserializeBox(serialized);
    expect(deserialized).toEqual(box);

    const boxId = hex.encode(blake2b256(serialized));
    expect(deserialized.boxId).toEqual(boxId);
  });

  it("Should deserialize from SigmaByteReader", () => {
    const box = deserializationTestVectors[0].box;

    const serialized = serializeBox(box).toBytes();
    const deserialized = deserializeBox(new SigmaByteReader(serialized));
    expect(deserialized).toEqual(box);

    const boxId = hex.encode(blake2b256(serialized));
    expect(deserialized.boxId).toEqual(boxId);
  });

  it("Should fail to parse box without the size flag for a unknown contract", () => {
    const box = mockUTxO({
      ergoTree:
        "1014040004000e208c27dd9d8a35aac1e3167d58858c0a8b4059b277da790552e37eba22df9b903504000400040204020101040205a0c21e040204080500040c040204a0c21e0402050a05c8010402d806d601b2a5730000d602b5db6501fed9010263ed93e4c67202050ec5a7938cb2db63087202730100017302d603b17202d604e4c6b272027303000605d605d90105049590720573047204e4c6b272029972057305000605d606b07202860273067307d901063c400163d803d6088c720601d6098c720801d60a8c72060286029a72097308ededed8c72080293c2b2a5720900d0cde4c6720a040792c1b2a5720900730992da720501997209730ae4c6720a0605ea02d1ededededededed93cbc27201e4c6a7060e927203730b93db63087201db6308a793e4c6720104059db07202730cd9010741639a8c720701e4c68c72070206057e72030593e4c6720105049ae4c6a70504730d92c1720199c1a77e9c9a7203730e730f058c72060292da720501998c72060173109972049d9c720473117312b2ad7202d9010763cde4c672070407e4c6b2a5731300040400"
    });

    expect(() => deserializeBox(serializeBox(box).toBytes())).toThrow(
      "ErgoTree parsing without the size flag is not supported."
    );
  });
});
