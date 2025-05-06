import {
  type Box,
  byteSizeOf,
  ensureBigInt,
  FEE_CONTRACT,
  first
} from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { manyTokensBoxes, regularBoxes, validBoxes } from "_test-vectors";
import { describe, expect, it, test } from "vitest";
import { boxVectors } from "../_test-vectors/boxVectors";
import { estimateBoxSize, deserializeBox, serializeBox } from "./boxSerializer";
import { mockUTxO } from "packages/mock-chain/src";

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

  const deserializationTestVectors = [
    {
      name: "size flag, with tokens and additional registers",
      box: mockUTxO({
        ergoTree:
          "1999030f0400040204020404040405feffffffffffffffff0105feffffffffffffffff01050004d00f040004000406050005000580dac409d819d601b2a5730000d602e4c6a70404d603db63087201d604db6308a7d605b27203730100d606b27204730200d607b27203730300d608b27204730400d6099973058c720602d60a999973068c7205027209d60bc17201d60cc1a7d60d99720b720cd60e91720d7307d60f8c720802d6107e720f06d6117e720d06d612998c720702720fd6137e720c06d6147308d6157e721206d6167e720a06d6177e720906d6189c72117217d6199c72157217d1ededededededed93c27201c2a793e4c672010404720293b27203730900b27204730a00938c7205018c720601938c7207018c72080193b17203730b9593720a730c95720e929c9c721072117e7202069c7ef07212069a9c72137e7214067e9c720d7e72020506929c9c721372157e7202069c7ef0720d069a9c72107e7214067e9c72127e7202050695ed720e917212730d907216a19d721872139d72197210ed9272189c721672139272199c7216721091720b730e",
        assets: [
          {
            tokenId: "50fdc80e168c153e472bd7e3dd18a4a0b9e90c550206fdbdb789ee8afdd3b1a9",
            amount: 1n
          }
        ],
        additionalRegisters: {
          R4: "05cab4cd9a03",
          R5: "04bc8968",
          R6: "0e20f7ef73c4a4ab91b84bb0a2905108d534114472ec057be3a57a9dfc9b1fbd85c1"
        }
      })
    },
    {
      name: "size flag, ergotree v1, with additional registers but no tokens",
      box: mockUTxO({
        ergoTree: "19090104c801d191a37300",
        additionalRegisters: { R4: "05cab4cd9a03" }
      })
    },
    {
      name: "size flag, ergotree v0, with tokens but not additional registers",
      box: mockUTxO({
        ergoTree: "0806d191a304c801",
        assets: [
          {
            tokenId: "50fdc80e168c153e472bd7e3dd18a4a0b9e90c550206fdbdb789ee8afdd3b1a9",
            amount: 1298743323231n
          }
        ]
      })
    },
    {
      name: "fee contract, no tokens, no additional registers",
      box: mockUTxO({ ergoTree: FEE_CONTRACT })
    },
    {
      name: "p2pk contract, with multiple tokens, but no additional registers",
      box: mockUTxO({
        ergoTree:
          "0008cd038d39af8c37583609ff51c6a577efe60684119da2fbd0d75f9c72372886a58a63",
        assets: [
          {
            tokenId: "de5ee573c6a492c129d51119649bfeaedfc9afa6f54af576e62e1f7f3bbd4207",
            amount: 1581138830n
          },
          {
            tokenId: "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489",
            amount: 1002634n
          },
          {
            tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
            amount: 50n
          },
          {
            tokenId: "74251ce2cb4eb2024a1a155e19ad1d1f58ff8b9e6eb034a3bb1fd58802757d23",
            amount: 200000000000n
          }
        ]
      })
    }
  ];

  test.each(deserializationTestVectors)(
    "roundtrip box serialization, case: $name",
    ({ name, box }) => {
      const serialized = serializeBox(box).toBytes();
      const deserialized = deserializeBox(serialized);
      expect(deserialized).toEqual(box);

      const boxId = hex.encode(blake2b256(serialized));
      expect(deserialized.boxId).toEqual(boxId);
    }
  );

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
