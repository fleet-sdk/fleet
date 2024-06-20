import { Amount, FleetError, TokenAmount } from "@fleet-sdk/common";
import { manyTokensBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../errors";
import { InsufficientTokenAmount } from "../../errors/insufficientTokenAmount";
import { MaxTokensOverflow } from "../../errors/maxTokensOverflow";
import { TokensCollection } from "./tokensCollection";

describe("Tokens collection", () => {
  const tokenA =
    "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB =
    "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";

  it("Should create an empty collection", () => {
    const collection = new TokensCollection();
    expect(collection.isEmpty).toBeTruthy();
  });

  it("Should create a filled and summed collection", () => {
    const collection = new TokensCollection([
      { tokenId: tokenA, amount: 50n },
      { tokenId: tokenB, amount: 10n },
      { tokenId: tokenB, amount: 20n }
    ]);

    expect(collection).toHaveLength(2);
  });

  it("Should lookup at collection and return true is a tokenId is included otherwise, return false", () => {
    const collection = new TokensCollection([
      { tokenId: tokenA, amount: 50n },
      { tokenId: tokenB, amount: 20n }
    ]);

    expect(collection).toHaveLength(2);

    expect(collection.contains(tokenA)).toBeTruthy();
    expect(collection.contains(tokenB)).toBeTruthy();

    expect(
      collection.contains(
        "d601123e8838b95cdaebe24e594276b2a89cd38e98add98405bb5327520ecf6c"
      )
    ).toBeFalsy();
  });

  it("Should create a filled and accumulative collection", () => {
    const collection = new TokensCollection(
      [
        { tokenId: tokenA, amount: 50n },
        { tokenId: tokenB, amount: 10n },
        { tokenId: tokenB, amount: 20n }
      ],
      { sum: false }
    );

    expect(collection).toHaveLength(3);
  });

  it("Should add distinct tokens", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });
    const tokensArray = collection.toArray();

    expect(collection).toHaveLength(2);
    expect(tokensArray).toHaveLength(2);
    expect(tokensArray.find((x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(tokensArray.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should throw if too many tokens are batch added", () => {
    const tokens = manyTokensBoxes.flatMap((x) => x.assets);

    expect(() => {
      const collection = new TokensCollection();
      collection.add({ tokenId: tokenA, amount: 50n });
      collection.add(tokens);
    }).toThrow(MaxTokensOverflow);
  });

  it("Should throw if too many tokens are individually added", () => {
    const tokens = manyTokensBoxes.flatMap((x) => x.assets);
    const collection = new TokensCollection();

    expect(() => {
      tokens.forEach((token) => collection.add(token));
    }).to.throw(MaxTokensOverflow);
  });

  it("Should throw if tokens without a TokenID are inserted", () => {
    // ...on construction
    expect(() => {
      new TokensCollection([{ amount: 50n }] as unknown as TokenAmount<Amount>);
    }).to.throw(FleetError, "TokenID is required.");

    const collection = new TokensCollection();

    // ...on add as a single token
    expect(() => {
      collection.add({ amount: 50n } as unknown as TokenAmount<Amount>);
    }).to.throw(FleetError, "TokenID is required.");

    // ...on add as a batch of tokens
    expect(() => {
      collection.add([
        { amount: 50n },
        { tokenId: tokenA, amount: 10 },
        { amount: 1n }
      ] as unknown as TokenAmount<Amount>[]);
    }).to.throw(FleetError, "TokenID is required.");
  });

  it("Should when trying to mint more than one token", () => {
    const collection = new TokensCollection();
    collection.mint({ amount: 1n, name: "test" });

    expect(() => {
      collection.mint({ amount: 1n, name: "test_2" });
    }).to.throw("Only one minting token is allowed per transaction.");
  });

  it("Should sum if the same tokenId is already included", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    expect(collection).toHaveLength(2);
    expect(
      collection.toArray().find((x) => x.tokenId === tokenA)?.amount
    ).toEqual(50n);

    collection.add({ tokenId: tokenA, amount: 100n }, { sum: true });

    expect(collection).toHaveLength(2);
    const tokensArray = collection.toArray();
    expect(tokensArray.find((x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(tokensArray.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should not sum if the same tokenId is already included but index is set", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.add({ tokenId: tokenA, amount: 100n }, { sum: true, index: 1 });

    expect(collection).toHaveLength(3);
    expect(collection.at(0).tokenId).toBe(tokenA);
    expect(collection.at(1).tokenId).toBe(tokenA);
    expect(collection.at(2).tokenId).toBe(tokenB);
  });

  it("Should place token item at specific index", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.add({ tokenId: tokenB, amount: 100n }, { index: 1 });

    expect(collection).toHaveLength(3);

    expect(collection.at(0).tokenId).toBe(tokenA);
    expect(collection.at(1).tokenId).toBe(tokenB);
    expect(collection.at(2).tokenId).toBe(tokenB);
  });

  it("Should add if sum = false if tokenId is already included", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    expect(collection).toHaveLength(2);
    expect(
      collection.toArray().find((x) => x.tokenId === tokenA)?.amount
    ).toEqual(50n);

    collection.add({ tokenId: tokenA, amount: 100n }, { sum: false });
    expect(collection).toHaveLength(3);
    const tokensArray = collection.toArray();
    expect(
      tokensArray.find((x) => x.tokenId === tokenA && x.amount === 50n)
    ).not.toBeFalsy();
    expect(
      tokensArray.find((x) => x.tokenId === tokenB && x.amount === 10n)
    ).not.toBeFalsy();
    expect(
      tokensArray.find((x) => x.tokenId === tokenA && x.amount === 100n)
    ).not.toBeFalsy();
  });

  it("Should add multiple tokens and sum if the same tokenId is already included", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: "50" });
    expect(collection).toHaveLength(1);
    expect(
      collection.toArray().find((x) => x.tokenId === tokenA)?.amount
    ).toEqual(50n);

    collection.add([
      { tokenId: tokenA, amount: 100n },
      { tokenId: tokenB, amount: "10" }
    ]);
    expect(collection).toHaveLength(2);
    const tokensArray = collection.toArray();
    expect(tokensArray.find((x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(tokensArray.find((x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should remove tokens from the list by tokenId", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.remove(tokenA);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().find((x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should remove tokens from the list by index", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.remove(0);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().find((x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should subtract if amount is specified by tokenId", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.remove(tokenA, 10n);

    expect(collection).toHaveLength(2);
    expect(
      collection.toArray().find((x) => x.tokenId === tokenA)?.amount
    ).toEqual(40n);
  });

  it("Should subtract if amount is specified by index", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.remove(0, 10n);

    expect(collection).toHaveLength(2);
    expect(
      collection.toArray().find((x) => x.tokenId === tokenA)?.amount
    ).toEqual(40n);
  });

  it("Should remove token if amount is equal to already inserted amount by tokenId", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.remove(tokenA, 50n);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().find((x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should remove token if amount is equal to already inserted amount by index", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });
    collection.add({ tokenId: tokenB, amount: 10n });

    collection.remove(1, 10n);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().find((x) => x.tokenId === tokenB)).toBeFalsy();
  });

  it("Should throw if amount is greater than already inserted amount", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });

    expect(() => {
      collection.remove(tokenA, 100n);
    }).toThrow(InsufficientTokenAmount);
  });

  it("Should throw when trying to remove using a not included tokenId", () => {
    const collection = new TokensCollection();
    collection.add({ tokenId: tokenA, amount: 50n });

    expect(() => {
      collection.remove(tokenB);
    }).toThrow(NotFoundError);
  });

  it("Should throw when trying to remove by an out of bounds index", () => {
    const collection = new TokensCollection();
    collection.add([
      { tokenId: tokenA, amount: 50n },
      { tokenId: tokenB, amount: 10n }
    ]);

    expect(() => {
      collection.remove(-1);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(2);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(10);
    }).toThrow(RangeError);
  });
});
