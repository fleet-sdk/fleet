import { find } from "lodash";
import { InsufficientTokenAmountError } from "../errors/insufficientTokenAmountError";
import { InvalidRegistersPackingError } from "../errors/invalidRegistersPackingError";
import { mockUnspentBoxes } from "../mocks/mockBoxes";
import { Address } from "../models";
import { OutputBuilder, SAFE_MIN_BOX_VALUE } from "./outputBuilder";

const address = "9fMPy1XY3GW4T6t3LjYofqmzER6x9cV21n5UVJTWmma4Y9mAW6c";
const ergoTree = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7";
const height = 816992;

describe("Constructor", () => {
  it("Should bind constructed params using 'recipient' param address as base58", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);

    expect(builder.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(builder.address).toEqual(address);
    expect(builder.ergoTree).toEqual(ergoTree);
    expect(builder.height).toEqual(height);
  });

  it("Should bind constructed params using 'recipient' param as ErgoTree", () => {
    const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTree, height);

    expect(builder.value).toEqual(SAFE_MIN_BOX_VALUE);
    expect(builder.address).toEqual(address);
    expect(builder.ergoTree).toEqual(ergoTree);
    expect(builder.height).toEqual(height);
  });
});

describe("Token handling", () => {
  const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";
  let builder!: OutputBuilder;

  beforeEach(() => {
    builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTree, height);
  });

  it("Should add distinct tokens", () => {
    builder.addToken(tokenA, 50n).addToken(tokenB, 10n);

    expect(builder.tokens).toHaveLength(2);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(find(builder.tokens, (x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should sum if the same tokenId is added more than one time", () => {
    builder.addToken(tokenA, "50").addToken(tokenB, 10n);
    expect(builder.tokens).toHaveLength(2);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)?.amount).toEqual(50n);

    builder.addToken(tokenA, 100n);
    expect(builder.tokens).toHaveLength(2);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(find(builder.tokens, (x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should add multiple tokens and sum if the same tokenId is added more than one time", () => {
    builder.addToken(tokenA, "50");
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(builder.tokens).toHaveLength(1);

    builder.addTokens([
      { tokenId: tokenA, amount: 100n },
      { tokenId: tokenB, amount: "10" }
    ]);
    expect(builder.tokens).toHaveLength(2);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(find(builder.tokens, (x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should remove tokens from the list", () => {
    builder.addToken(tokenA, 50n).addToken(tokenB, 10n);
    builder.removeToken(tokenA);

    expect(builder.tokens).toHaveLength(1);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should subtract if amount is specified", () => {
    builder.addToken(tokenA, 50n).addToken(tokenB, 10n);
    builder.removeToken(tokenA, 10n);

    expect(builder.tokens).toHaveLength(2);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)?.amount).toEqual(40n);
  });

  it("Should remove token if amount is equal to already inserted amount", () => {
    builder.addToken(tokenA, 50n).addToken(tokenB, 10n);
    builder.removeToken(tokenA, 50n);

    expect(builder.tokens).toHaveLength(1);
    expect(find(builder.tokens, (x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should throw if amount is greater than already inserted amount", () => {
    builder.addToken(tokenA, 50n);
    expect(() => {
      builder.removeToken(tokenA, 100n);
    }).toThrow(InsufficientTokenAmountError);
  });

  it("Should not to throw when trying to remove an not included token ", () => {
    builder.addToken(tokenA, 50n);
    expect(() => {
      builder.removeToken(tokenB);
    }).not.toThrow();
  });
});

describe("Token minting", () => {
  let builder!: OutputBuilder;

  beforeEach(() => {
    builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTree, height);
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
    builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTree, height);
  });

  it("Should bind registers properly", () => {
    builder.setAdditionalRegisters({
      R4: "0580c0fc82aa02",
      R5: "0e240008cd036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
      R6: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
    });

    expect(builder.additionalRegisters).toEqual({
      R4: "0580c0fc82aa02",
      R5: "0e240008cd036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17",
      R6: "07036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
    });

    expect(() => {
      builder.setAdditionalRegisters({
        R4: "0580c0fc82aa02",
        R5: "0e240008cd036b84756b351ee1c57fd8c302e66a1bb927e5d8b6e1a8e085935de3971f84ae17"
      });
    }).not.toThrow();

    expect(() => {
      builder.setAdditionalRegisters({
        R4: "0580c0fc82aa02"
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
        R6: "0580c0fc82aa02"
      });
    }).toThrow(InvalidRegistersPackingError);
  });
});

describe("Building", () => {
  const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";

  it("Should build box without tokens", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height).build();

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE.toString());
    expect(boxCandidate.ergoTree).toEqual(new Address(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([]);
    expect(boxCandidate.additionalRegisters).toEqual({});
  });

  it("Should build box with tokens", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .addToken(tokenA, "15")
      .addToken(tokenB, 1n)
      .build();

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE.toString());
    expect(boxCandidate.ergoTree).toEqual(new Address(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      { tokenId: tokenA, amount: "15" },
      { tokenId: tokenB, amount: "1" }
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
      .build(mockUnspentBoxes);

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE.toString());
    expect(boxCandidate.ergoTree).toEqual(new Address(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      {
        tokenId: mockUnspentBoxes[0].boxId, // should be the same as the first input
        amount: "100"
      }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({});
  });

  it("Should build box with tokens and minting", () => {
    const boxCandidate = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
      .addToken(tokenA, "15")
      .addToken(tokenB, 1n)
      .mintToken({
        amount: 100n,
        name: "TestToken",
        decimals: 4,
        description: "Description test"
      })
      .build(mockUnspentBoxes);

    expect(boxCandidate.boxId).toBeUndefined();
    expect(boxCandidate.value).toEqual(SAFE_MIN_BOX_VALUE.toString());
    expect(boxCandidate.ergoTree).toEqual(new Address(address).ergoTree);
    expect(boxCandidate.creationHeight).toEqual(height);
    expect(boxCandidate.assets).toEqual([
      {
        tokenId: mockUnspentBoxes[0].boxId, // should be the same as the first input
        amount: "100"
      },
      { tokenId: tokenA, amount: "15" },
      { tokenId: tokenB, amount: "1" }
    ]);
    expect(boxCandidate.additionalRegisters).toEqual({});
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
    }).toThrow();
  });
});
