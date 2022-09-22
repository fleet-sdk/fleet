import { find } from "lodash";
import { InsufficientTokenAmount } from "../../errors/insufficientTokenAmount";
import { MaxTokensOverflow } from "../../errors/maxTokensOverflow";
import { manyTokensBoxesMock } from "../../mocks/mockBoxes";
import { TokensCollection } from "./tokensCollection";

describe("Tokens collection", () => {
  const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";

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
    collection.add({ tokenId: tokenA, amount: 50n }).add({ tokenId: tokenB, amount: 10n });
    const tokensArray = collection.toArray();

    expect(collection).toHaveLength(2);
    expect(tokensArray).toHaveLength(2);
    expect(find(tokensArray, (x) => x.tokenId === tokenA)?.amount).toEqual(50n);
    expect(find(tokensArray, (x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should throw if too many tokens are batch added", () => {
    const tokens = manyTokensBoxesMock.flatMap((x) => x.assets);

    expect(() => {
      new TokensCollection().add({ tokenId: tokenA, amount: 50n }).add(tokens);
    }).toThrow(MaxTokensOverflow);
  });

  it("Should throw if too many tokens are individually added", () => {
    const tokens = manyTokensBoxesMock.flatMap((x) => x.assets);
    const collection = new TokensCollection();

    expect(() => {
      tokens.forEach((token) => collection.add(token));
    }).toThrow(MaxTokensOverflow);
  });

  it("Should sum if the same tokenId is already included", () => {
    const collection = new TokensCollection()
      .add({ tokenId: tokenA, amount: 50n })
      .add({ tokenId: tokenB, amount: 10n });

    expect(collection).toHaveLength(2);
    expect(find(collection.toArray(), (x) => x.tokenId === tokenA)?.amount).toEqual(50n);

    collection.add({ tokenId: tokenA, amount: 100n }, { sum: true });
    expect(collection).toHaveLength(2);
    const tokensArray = collection.toArray();
    expect(find(tokensArray, (x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(find(tokensArray, (x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should add if sum = false if tokenId is already included", () => {
    const collection = new TokensCollection()
      .add({ tokenId: tokenA, amount: 50n })
      .add({ tokenId: tokenB, amount: 10n });

    expect(collection).toHaveLength(2);
    expect(find(collection.toArray(), (x) => x.tokenId === tokenA)?.amount).toEqual(50n);

    collection.add({ tokenId: tokenA, amount: 100n }, { sum: false });
    expect(collection).toHaveLength(3);
    const tokensArray = collection.toArray();
    expect(find(tokensArray, (x) => x.tokenId === tokenA && x.amount === 50n)).not.toBeFalsy();
    expect(find(tokensArray, (x) => x.tokenId === tokenB && x.amount === 10n)).not.toBeFalsy();
    expect(find(tokensArray, (x) => x.tokenId === tokenA && x.amount === 100n)).not.toBeFalsy();
  });

  it("Should add multiple tokens and sum if the same tokenId is already included", () => {
    const collection = new TokensCollection().add({ tokenId: tokenA, amount: "50" });
    expect(collection).toHaveLength(1);
    expect(find(collection.toArray(), (x) => x.tokenId === tokenA)?.amount).toEqual(50n);

    collection.add([
      { tokenId: tokenA, amount: 100n },
      { tokenId: tokenB, amount: "10" }
    ]);
    expect(collection).toHaveLength(2);
    const tokensArray = collection.toArray();
    expect(find(tokensArray, (x) => x.tokenId === tokenA)?.amount).toEqual(150n);
    expect(find(tokensArray, (x) => x.tokenId === tokenB)?.amount).toEqual(10n);
  });

  it("Should remove tokens from the list", () => {
    const collection = new TokensCollection()
      .add({ tokenId: tokenA, amount: 50n })
      .add({ tokenId: tokenB, amount: 10n });

    collection.remove(tokenA);

    expect(collection).toHaveLength(1);
    expect(find(collection.toArray(), (x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should subtract if amount is specified", () => {
    const collection = new TokensCollection()
      .add({ tokenId: tokenA, amount: 50n })
      .add({ tokenId: tokenB, amount: 10n });

    collection.remove(tokenA, 10n);

    expect(collection).toHaveLength(2);
    expect(find(collection.toArray(), (x) => x.tokenId === tokenA)?.amount).toEqual(40n);
  });

  it("Should remove token if amount is equal to already inserted amount", () => {
    const collection = new TokensCollection()
      .add({ tokenId: tokenA, amount: 50n })
      .add({ tokenId: tokenB, amount: 10n });

    collection.remove(tokenA, 50n);

    expect(collection).toHaveLength(1);
    expect(find(collection.toArray(), (x) => x.tokenId === tokenA)).toBeFalsy();
  });

  it("Should throw if amount is greater than already inserted amount", () => {
    const collection = new TokensCollection().add({ tokenId: tokenA, amount: 50n });
    expect(() => {
      collection.remove(tokenA, 100n);
    }).toThrow(InsufficientTokenAmount);
  });

  it("Should not to throw when trying to remove an not included token ", () => {
    const collection = new TokensCollection().add({ tokenId: tokenA, amount: 50n });

    expect(() => {
      collection.remove(tokenB);
    }).not.toThrow();
  });
});
