import { ErgoBox, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it, vi } from "vitest";
import { MockChain } from "../mockChain";
import { KeyedMockChainParty } from "./keyedMockChainParty";

describe("Keyed mock chain party", () => {
  const chain = new MockChain();

  it("Should create a keyed instance", () => {
    const namedParty = new KeyedMockChainParty(chain, "bob");

    expect(namedParty.name).to.be.equal("bob");
    expect(namedParty.utxos).to.have.length(0);
    expect(namedParty.key).not.to.be.undefined;
    expect(namedParty.address).to.be.equal(namedParty.key?.address);
    expect(namedParty.ergoTree).to.be.equal(namedParty.key?.address.ergoTree);
    expect(namedParty.chain).to.be.equal(chain);

    const unnamedParty = new KeyedMockChainParty(chain);
    expect(unnamedParty.name).to.be.equal(unnamedParty.address.encode());
  });

  it("Should add UTxOs directly", () => {
    const party = new KeyedMockChainParty(chain, "bob");
    party.addUTxOs(regularBoxes);

    expect(party.utxos).to.have.length(regularBoxes.length);
  });

  it("Should add UTxOs directly using withUTxOs syntax sugar", () => {
    const party = new KeyedMockChainParty(chain, "bob");
    const addUTxOsSpy = vi.spyOn(party, "addUTxOs");

    party.withUTxOs(regularBoxes);

    expect(party.key).not.to.be.undefined;
    expect(party.utxos).to.have.length(regularBoxes.length);
    expect(addUTxOsSpy).toHaveBeenCalledTimes(1);
    expect(addUTxOsSpy).toHaveBeenCalledWith(regularBoxes);
  });

  it("Should add balance", () => {
    const party = new KeyedMockChainParty(chain, "bob");
    party.addBalance({ nanoergs: "10000000000" });

    expect(party.utxos).to.have.length(1);
    expect(party.utxos.at(0)).to.deep.contain({ value: 10000000000n, assets: [] });
    expect(ErgoBox.validate(party.utxos.at(0))).to.be.true;

    const sigUsd = {
      tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
      amount: 200n
    };

    party.addBalance({
      tokens: [sigUsd]
    });

    expect(party.utxos.at(1)).to.deep.contain({
      value: SAFE_MIN_BOX_VALUE, // if nanoergs is omitted then SAFE_MIN_BOX_VALUE is added
      assets: [sigUsd]
    });

    expect(party.balance).to.be.deep.equal({
      nanoergs: 10000000000n + SAFE_MIN_BOX_VALUE,
      tokens: [sigUsd]
    });
    expect(ErgoBox.validate(party.utxos.at(1))).to.be.true;
  });

  it("Should add UTxOs balance using withBalance syntax sugar", () => {
    const party = new KeyedMockChainParty(chain, "bob");
    const addBalanceSpy = vi.spyOn(party, "addBalance");

    party.withBalance({ nanoergs: "10000000000" });

    expect(party.utxos.at(0)).to.deep.contain({ value: 10000000000n, assets: [] });
    expect(ErgoBox.validate(party.utxos.at(0))).to.be.true;

    expect(party.utxos).to.have.length(1);
    expect(addBalanceSpy).toHaveBeenCalledTimes(1);
  });
});
