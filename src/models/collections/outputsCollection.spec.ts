import { OutputBuilder, SAFE_MIN_BOX_VALUE } from "../../builder/outputBuilder";
import { RECOMMENDED_MIN_FEE_VALUE } from "../../builder/transactionBuilder";
import { NotFoundError } from "../../errors";
import { first } from "../../utils/arrayUtils";
import { OutputsCollection } from "./outputsCollection";

const address = "9hY16vzHmmfyVBwKeFGHvb2bMFsG94A1u7To1QWtUokACyFVENQ";
const height = 845575;

describe("outputs collection", () => {
  it("Should create and empty collection", () => {
    const collection = new OutputsCollection();
    expect(collection.isEmpty).toBeTruthy();
  });

  it("Should create a filled collection", () => {
    const collection = new OutputsCollection([
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
    ]);
    expect(collection).toHaveLength(2);
  });

  it("Should add a single item", () => {
    const collection = new OutputsCollection();
    const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    collection.add(output);

    expect(collection).toHaveLength(1);
    expect(first(collection.toArray())).toBe(output);
  });

  it("Should add a multiple items", () => {
    const collection = new OutputsCollection();
    const outputs = [
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height)
    ];
    collection.add(outputs);

    expect(collection).toHaveLength(2);
    expect(collection.toArray()).toEqual(outputs);
  });

  it("Should remove by object reference", () => {
    const outputA = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    const outputB = new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height);
    const collection = new OutputsCollection([outputA, outputB]);
    expect(collection).toHaveLength(2);

    collection.remove(outputA);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().includes(outputA)).toBeFalsy();
  });

  it("Should remove by index", () => {
    const outputA = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    const outputB = new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height);
    const collection = new OutputsCollection([outputA, outputB]);
    expect(collection).toHaveLength(2);

    collection.remove(1);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().includes(outputB)).toBeFalsy();
  });

  it("Should throw if not found", () => {
    const notIncludedOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE * 3n, address, height);

    const collection = new OutputsCollection([
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height)
    ]);

    expect(() => {
      collection.remove(notIncludedOutput);
    }).toThrow(NotFoundError);
  });

  it("Should throw if not found", () => {
    const collection = new OutputsCollection([
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 3n, address, height)
    ]);

    expect(() => {
      collection.remove(-1);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(3);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(100);
    }).toThrow(RangeError);
  });
});

describe("Target building", () => {
  const tokenA = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";
  const tokenB = "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5";
  const tokenC = "4bdafc19f427fde7e335a38b1fac384143721249f037e0c2e2716631fdcc6741";
  const tokenD = "5614535ba46927145c3d30fed8f14b08bd48a143b24136809f9e47afc40643c4";

  it("Should sum amounts and build target", () => {
    const collection = new OutputsCollection()
      .add(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height).addTokens({
          tokenId: tokenA,
          amount: 12348n
        })
      )
      .add(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
          .addTokens({ tokenId: tokenA, amount: "11" })
          .addTokens({ tokenId: tokenB, amount: 50n })
      );

    expect(collection.buildSelectionTarget()).toEqual({
      nanoErgs: SAFE_MIN_BOX_VALUE * 2n,
      tokens: [
        { tokenId: tokenA, amount: 12359n },
        { tokenId: tokenB, amount: 50n }
      ]
    });
  });

  it("Should ignore minting tokens", () => {
    const collection = new OutputsCollection().add(
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
        .addTokens({ tokenId: tokenA, amount: 12348n })
        .mintToken({ name: "testToken", amount: 10n })
    );

    expect(collection.buildSelectionTarget()).toEqual({
      nanoErgs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokenA, amount: 12348n }]
    });
  });

  it("Should sum amounts and build target starting from a basis object", () => {
    const basis = {
      nanoErgs: RECOMMENDED_MIN_FEE_VALUE,
      tokens: [
        { tokenId: tokenA, amount: 12359n },
        { tokenId: tokenC, amount: 20n },
        { tokenId: tokenD, amount: undefined }
      ]
    };

    const collection = new OutputsCollection()
      .add(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height).addTokens({
          tokenId: tokenA,
          amount: 12348n
        })
      )
      .add(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
          .addTokens({ tokenId: tokenA, amount: "11" })
          .addTokens({ tokenId: tokenB, amount: 50n })
      );

    expect(collection.buildSelectionTarget(basis)).toEqual({
      nanoErgs: SAFE_MIN_BOX_VALUE * 2n + basis.nanoErgs,
      tokens: [
        { tokenId: tokenA, amount: 12359n + (basis.tokens[0].amount || 0n) },
        { tokenId: basis.tokens[1].tokenId, amount: basis.tokens[1].amount },
        { tokenId: tokenB, amount: 50n }
      ]
    });
  });
});
