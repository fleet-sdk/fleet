import { NonMandatoryRegisters } from "@fleet-sdk/common";
import { SBool, SInt } from "@fleet-sdk/serializer";
import { regularBoxes } from "_test-vectors";
import { beforeEach, describe, expect, it } from "vitest";
import {
  InvalidRegistersPacking,
  UndefinedCreationHeight,
  UndefinedMintingContext
} from "../errors";
import { ErgoAddress, ErgoTree, TokensCollection } from "../models";
import { estimateMinBoxValue, OutputBuilder, SAFE_MIN_BOX_VALUE } from "./outputBuilder";

const address = "9fMPy1XY3GW4T6t3LjYofqmzER6x9cV21n5UVJTWmma4Y9mAW6c";
const ergoTreeHex = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7";
const height = 816992;

describe("Constructor", () => {
  it("Should construct using 'recipient' param address as base58", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);

    expect(builder.value).toBe(SAFE_MIN_BOX_VALUE);
    expect(builder.address.toString()).toBe(address);
    expect(builder.ergoTree).toBe(ergoTreeHex);
    expect(builder.creationHeight).toBe(height);
  });

  it("Should construct with no creation height", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address);

    expect(builder.value).toBe(SAFE_MIN_BOX_VALUE);
    expect(builder.address.toString()).toBe(address);
    expect(builder.ergoTree).toBe(ergoTreeHex);
    expect(builder.creationHeight).toBeUndefined();
  });

  it("Should construct using 'recipient' param as ErgoTree hex string", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTreeHex, height);

    expect(builder.value).toBe(SAFE_MIN_BOX_VALUE);
    expect(builder.address.toString()).toBe(address);
    expect(builder.ergoTree).toBe(ergoTreeHex);
    expect(builder.creationHeight).toBe(height);
  });

  it("Should construct using 'recipient' param as ErgoTree instance", () => {
    const ergoTreeInstance = new ErgoTree(ergoTreeHex);
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTreeInstance, height);

    expect(builder.value).toBe(SAFE_MIN_BOX_VALUE);
    expect(builder.address.toString()).toBe(address);
    expect(builder.ergoTree).toBe(ergoTreeInstance.toHex());
    expect(builder.creationHeight).toBe(height);
  });

  it("Should construct with no creation height and set it using setCreationHeight()", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address);
    expect(builder.creationHeight).toBeUndefined();

    builder.setCreationHeight(10);
    expect(builder.creationHeight).toBe(10);

    builder.setCreationHeight(height);
    expect(builder.creationHeight).toBe(height);
  });

  it("Should construct using 'recipient' param as ErgoAddress", () => {
    const ergoAddress = ErgoAddress.fromBase58(address);
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoAddress, height);

    expect(builder.address).toBe(ergoAddress);
  });

  it("Should fail if value is less than or equal to zero", () => {
    expect(() => {
      new OutputBuilder(0n, address, height);
    }).toThrow();

    expect(() => {
      new OutputBuilder(-1n, address, height);
    }).toThrow();
  });
});

describe("Creation height", () => {
  it("Should construct with no creation height and set it using setCreationHeight()", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address);
    expect(builder.creationHeight).toBeUndefined();

    builder.setCreationHeight(10);
    expect(builder.creationHeight).toBe(10);

    builder.setCreationHeight(height);
    expect(builder.creationHeight).toBe(height);
  });

  it("Should replace creation height", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    expect(builder.creationHeight).toBe(height); // should be the same as constructor

    builder.setCreationHeight(10);
    expect(builder.creationHeight).toBe(10); // should replace by default

    builder.setCreationHeight(11, { replace: true });
    expect(builder.creationHeight).toBe(11); // should replace explicitly
  });

  it("Should not replace creation height", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address);
    expect(builder.creationHeight).toBeUndefined(); // should be the same as constructor (undefined on this case)

    builder.setCreationHeight(height, { replace: false });
    expect(builder.creationHeight).toBe(height); // should set height since creationsHeight is undefined

    builder.setCreationHeight(11, { replace: false });
    expect(builder.creationHeight).toBe(height); // should not replace
  });
});

describe("Token handling", () => {
  const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";
  let builder!: OutputBuilder;

  beforeEach(() => {
    builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTreeHex, height);
  });

  it("Should add distinct tokens", () => {
    builder.addTokens({ tokenId: tokenA, amount: 50n }).addTokens({ tokenId: tokenB, amount: 10n });

    expect(builder.assets).toHaveLength(2);
    const tokens = builder.assets.toArray();
    expect(tokens.find((x) => x.tokenId === tokenA)?.amount).toBe(50n);
    expect(tokens.find((x) => x.tokenId === tokenB)?.amount).toBe(10n);
  });

  it("Should add tokens from context ejector", () => {
    builder.eject(({ tokens }) =>
      tokens.add([
        { tokenId: tokenA, amount: 50n },
        { tokenId: tokenB, amount: 10n }
      ])
    );

    expect(builder.assets).toHaveLength(2);
    const tokens = builder.assets.toArray();
    expect(tokens.find((x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(tokens.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should add tokens from external TokensCollection", () => {
    const collection = new TokensCollection([
      { tokenId: tokenA, amount: 50n },
      { tokenId: tokenB, amount: 10n }
    ]);

    builder.addTokens(collection);

    expect(builder.assets).toHaveLength(2);
    const tokens = builder.assets.toArray();
    expect(tokens.find((x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(tokens.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should add tokens with amount equal to one for NFTs", () => {
    builder.addNfts(tokenA, tokenB);
    const tokens = builder.assets.toArray();

    expect(tokens).toHaveLength(2);
    expect(tokens.find((x) => x.tokenId === tokenA)?.amount).toEqual(1n);
    expect(tokens.find((x) => x.tokenId === tokenB)?.amount).toEqual(1n);
  });

  it("Should sum if the same tokenId is added more than one time", () => {
    builder
      .addTokens({ tokenId: tokenA, amount: "50" })
      .addTokens({ tokenId: tokenB, amount: 10n });
    expect(builder.assets).toHaveLength(2);
    expect(builder.assets.toArray().find((x) => x.tokenId === tokenA)?.amount).toEqual(50n);

    builder.addTokens({ tokenId: tokenA, amount: 100n });
    expect(builder.assets).toHaveLength(2);
    const tokens = builder.assets.toArray();
    expect(tokens.find((x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(tokens.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should add multiple tokens and sum if the same tokenId is added more than one time", () => {
    builder.addTokens({ tokenId: tokenA, amount: "50" });
    expect(builder.assets.toArray().find((x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(builder.assets).toHaveLength(1);

    builder.addTokens([
      { tokenId: tokenA, amount: 100n },
      { tokenId: tokenB, amount: "10" }
    ]);
    expect(builder.assets).toHaveLength(2);
    const tokens = builder.assets.toArray();
    expect(tokens.find((x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(tokens.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should not sum if the same tokenId is added more than one time", () => {
    builder.addTokens({ tokenId: tokenA, amount: "50" });
    expect(builder.assets.toArray().find((x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(builder.assets).toHaveLength(1);

    builder.addTokens(
      [
        { tokenId: tokenA, amount: 110n },
        { tokenId: tokenB, amount: "10" }
      ],
      { sum: false }
    );
    expect(builder.assets).toHaveLength(3);
    const tokens = builder.assets.toArray();
    expect(tokens.find((x) => x.tokenId === tokenA && x.amount === 50n)).not.toBeFalsy();
    expect(tokens.find((x) => x.tokenId === tokenB && x.amount === 10n)).not.toBeFalsy();
    expect(tokens.find((x) => x.tokenId === tokenA && x.amount === 110n)).not.toBeFalsy();
  });

  it("Should remove tokens from the list using context ejector", () => {
    builder.addTokens({ tokenId: tokenA, amount: 50n }).addTokens({ tokenId: tokenB, amount: 10n });
    expect(builder.assets).toHaveLength(2);

    builder.eject(({ tokens }) => tokens.remove(tokenA));

    expect(builder.assets).toHaveLength(1);
    expect(builder.assets.toArray().find((x) => x.tokenId === tokenA)).toBeFalsy();
  });
});

describe("Token minting", () => {
  let builder!: OutputBuilder;

  beforeEach(() => {
    builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTreeHex, height);
  });

  it("Should convert amount to bigint", () => {
    builder.mintToken({
      amount: "100",
      name: "TestToken",
      decimals: 2,
      description: "test description"
    });

    expect(builder.minting).toEqual({
      amount: 100n,
      name: "TestToken",
      decimals: 2,
      description: "test description"
    });
  });
});

describe("Additional registers", () => {
  let builder!: OutputBuilder;

  beforeEach(() => {
    builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTreeHex, height);
  });

  it("Should bind registers properly", () => {
    builder.setAdditionalRegisters({
      R4: "0580c0fc82aa02",
      R5: "0e240008cd036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
      R6: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
      R7: SBool(true), // should convert to hex automatically
      R8: undefined // should eliminate undefined properties
    });

    expect(builder.additionalRegisters).toEqual({
      R4: "0580c0fc82aa02",
      R5: "0e240008cd036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
      R6: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
      R7: "0101"
    });

    expect(() => {
      builder.setAdditionalRegisters({
        R4: "0580c0fc82aa02",
        R5: "0e240008cd036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
        R6: SInt(0)
      });
    }).not.toThrow();

    expect(() => {
      builder.setAdditionalRegisters({
        R4: "0580c0fc82aa02"
      });
    }).not.toThrow();

    expect(() => {
      builder.setAdditionalRegisters({
        R4: SInt(20)
      });
    }).not.toThrow();
  });

  /**
   * Registers should be densely packed. It's not possible to use
   * R9 without adding register R4 to R8, for example.
   */
  it("Should throw if some register is skipped", () => {
    // R4 not included
    expect(() => {
      builder.setAdditionalRegisters({
        R5: "0580c0fc82aa02"
      } as NonMandatoryRegisters);
    }).toThrow(InvalidRegistersPacking);

    // R5 not included
    expect(() => {
      builder.setAdditionalRegisters({
        R4: "0580c0fc82aa02",
        R6: "0580c0fc82aa02"
      } as NonMandatoryRegisters);
    }).toThrow(InvalidRegistersPacking);

    // R5 explicitly set to undefined
    expect(() => {
      builder.setAdditionalRegisters({
        R4: "0580c0fc82aa02",
        R5: undefined,
        R6: "0580c0fc82aa02"
      } as NonMandatoryRegisters);
    }).toThrow(InvalidRegistersPacking);
  });
});

describe("Building", () => {
  const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";

  it("Should build box without tokens", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height).build();

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(boxCandidate.ergoTree).toEqual(ErgoAddress.fromBase58(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([]);
    expect(boxCandidate.additionalRegisters).toEqual({});
  });

  it("Should build box with tokens", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .addTokens({ tokenId: tokenA, amount: "15" })
      .addTokens({ tokenId: tokenB, amount: 1n })
      .build();

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(boxCandidate.ergoTree).toEqual(ErgoAddress.fromBase58(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      { tokenId: tokenA, amount: 15n },
      { tokenId: tokenB, amount: 1n }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({});
  });

  it("Should build box with minting token", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .mintToken({
        amount: 100n,
        name: "TestToken",
        decimals: 4,
        description: "Description test"
      })
      .build(regularBoxes);

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(boxCandidate.ergoTree).toEqual(ErgoAddress.fromBase58(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      {
        tokenId: regularBoxes[0].boxId, // should be the same as the first input
        amount: 100n
      }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({
      R4: "0e0954657374546f6b656e",
      R5: "0e104465736372697074696f6e2074657374",
      R6: "0e0134"
    });
  });

  it("Should build box with tokens and minting", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .addTokens([
        { tokenId: tokenA, amount: "15" },
        { tokenId: tokenB, amount: 1n }
      ])
      .mintToken({
        amount: 100n,
        name: "TestToken"
      })
      .build(regularBoxes);

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(boxCandidate.ergoTree).toEqual(ErgoAddress.fromBase58(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      { tokenId: tokenA, amount: 15n },
      { tokenId: tokenB, amount: 1n },
      {
        tokenId: regularBoxes[0].boxId, // should be the same as the first input
        amount: 100n
      }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({
      R4: "0e0954657374546f6b656e",
      R5: "0e00", // should be empty string
      R6: "0e0130" // should be zero
    });
  });

  it("Should keep the order of the call when minting a token", () => {
    let boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .mintToken({ amount: 100n, name: "TestToken" })
      .addTokens({ tokenId: tokenA, amount: 15n });

    expect(boxCandidate.assets.at(0).tokenId).to.be.undefined;

    boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .addTokens({ tokenId: tokenA, amount: 15n })
      .mintToken({ amount: 100n, name: "TestToken" })
      .addTokens({ tokenId: tokenB, amount: 10n });

    expect(boxCandidate.assets.at(1).tokenId).to.be.undefined;
  });

  it("Should should add default values if non mandatory minting field are filled", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .mintToken({
        amount: 100n
      })
      .build(regularBoxes);

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(boxCandidate.ergoTree).toEqual(ErgoAddress.fromBase58(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      {
        tokenId: regularBoxes[0].boxId, // should be the same as the first input
        amount: 100n
      }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({
      R4: "0e00", // should be empty string
      R5: "0e00", // should be empty string
      R6: "0e0130" // should be zero
    });
  });

  it("Should should preserve explicitly defined registers", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .mintToken({
        amount: 100n,
        name: "TestToken"
      })
      .setAdditionalRegisters({ R4: "0e00" })
      .build(regularBoxes);

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(boxCandidate.ergoTree).toEqual(ErgoAddress.fromBase58(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      {
        tokenId: regularBoxes[0].boxId, // should be the same as the first input
        amount: 100n
      }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({ R4: "0e00" });
  });

  it("Should fail if inputs aren't included", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height).mintToken({
      amount: 100n,
      name: "TestToken",
      decimals: 4,
      description: "Description test"
    });

    expect(() => {
      builder.build();
    }).toThrow(UndefinedMintingContext);
  });

  it("Should fail no creation height is added", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address);

    expect(() => {
      builder.build();
    }).toThrow(UndefinedCreationHeight);
  });

  it("Should set min box value", () => {
    const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, address);
    expect(output.value).toBe(SAFE_MIN_BOX_VALUE);

    output.setValue(SAFE_MIN_BOX_VALUE * 2n);
    expect(output.value).toBe(SAFE_MIN_BOX_VALUE * 2n);
  });

  it("Should estimate min box value", () => {
    const output = new OutputBuilder(estimateMinBoxValue(), address, height);
    expect(output.value).toBe(28440n);

    output.addTokens({ tokenId: tokenA, amount: 10n });
    expect(output.value).toBe(40320n);

    output.addTokens({ tokenId: tokenB, amount: 90n });
    expect(output.value).toBe(52200n);

    output.mintToken({ amount: 100n });
    expect(output.value).toBe(64080n);
  });

  it("Should estimate min box value with custom value per byte", () => {
    const output = new OutputBuilder(estimateMinBoxValue(200n), address, height);
    expect(output.value).toBe(15800n);

    output.addTokens({ tokenId: tokenA, amount: 10n });
    expect(output.value).toBe(22400n);

    output.addTokens({ tokenId: tokenB, amount: 90n });
    expect(output.value).toBe(29000n);
  });

  it("Should replace dynamic value estimation by fixed value", () => {
    const output = new OutputBuilder(estimateMinBoxValue(), address, height);
    expect(output.value).toBe(28440n);

    output.setValue(SAFE_MIN_BOX_VALUE);
    expect(output.value).toBe(SAFE_MIN_BOX_VALUE);
  });

  it("Should replace fixed value by dynamic value estimation", () => {
    const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    expect(output.value).toBe(SAFE_MIN_BOX_VALUE);

    output.setValue(estimateMinBoxValue());
    expect(output.value).toBe(28440n);
  });
});
