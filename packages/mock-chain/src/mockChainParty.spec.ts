import { ErgoAddress, ErgoBox, FEE_CONTRACT, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { describe, expect, it, vi } from "vitest";
import { MockChain } from "./mockChain";
import { MockChainParty, MockChainPartyParams } from "./mockChainParty";
import { regularBoxesMock } from "./tests/regularBoxesMock";

describe("Mock chain party", () => {
  const chain = new MockChain();

  it("Should create a keyed instance", () => {
    const namedParty = new MockChainParty(chain, "bob");

    expect(namedParty.name).to.be.equal("bob");
    expect(namedParty.utxos).to.have.length(0);
    expect(namedParty.key).not.to.be.undefined;
    expect(namedParty.address).to.be.equal(namedParty.key?.address);
    expect(namedParty.ergoTree).to.be.equal(namedParty.key?.address.ergoTree);
    expect(namedParty.chain).to.be.equal(chain);

    const unnamedParty = new MockChainParty(chain);
    expect(unnamedParty.name).to.be.equal(unnamedParty.address.encode());
  });

  it("Should create a non-keyed party", () => {
    const nonKeyedNamedParty = new MockChainParty(chain, { name: "miner", ergoTree: FEE_CONTRACT });
    const address = ErgoAddress.fromErgoTree(FEE_CONTRACT);

    expect(nonKeyedNamedParty.name).to.be.equal("miner");
    expect(nonKeyedNamedParty.utxos).to.have.length(0);
    expect(nonKeyedNamedParty.key).to.be.undefined;
    expect(nonKeyedNamedParty.address.encode()).to.be.equal(address.encode());
    expect(nonKeyedNamedParty.ergoTree).to.be.equal(FEE_CONTRACT);
    expect(nonKeyedNamedParty.ergoTree).to.be.equal(nonKeyedNamedParty.address.ergoTree);

    const nonKeyedUnnamedParty = new MockChainParty(chain, { ergoTree: FEE_CONTRACT });
    expect(nonKeyedUnnamedParty.name).to.be.equal(nonKeyedUnnamedParty.address.encode());
  });

  it("Should throw if creating a non-keyed party without an ErgoTree", () => {
    expect(() => new MockChainParty(chain, { name: "miner" } as MockChainPartyParams)).to.throw(
      "A non-keyed party needs a valid ErgoTree to be instantiated."
    );
  });

  it("Should add UTxOs directly", () => {
    const party = new MockChainParty(chain, "bob");
    party.addUTxOs(regularBoxesMock);

    expect(party.utxos).to.have.length(regularBoxesMock.length);
  });

  it("Should add UTxOs directly using withUTxOs syntax sugar", () => {
    const party = new MockChainParty(chain, "bob");
    const addUTxOsSpy = vi.spyOn(party, "addUTxOs");

    party.withUTxOs(regularBoxesMock);

    expect(party.utxos).to.have.length(regularBoxesMock.length);
    expect(addUTxOsSpy).toHaveBeenCalledTimes(1);
    expect(addUTxOsSpy).toHaveBeenCalledWith(regularBoxesMock);
  });

  it("Should add balance", () => {
    const party = new MockChainParty(chain, "bob");
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
    const party = new MockChainParty(chain, "bob");
    const addBalanceSpy = vi.spyOn(party, "addBalance");

    party.withBalance({ nanoergs: "10000000000" });

    expect(party.utxos.at(0)).to.deep.contain({ value: 10000000000n, assets: [] });
    expect(ErgoBox.validate(party.utxos.at(0))).to.be.true;

    expect(party.utxos).to.have.length(1);
    expect(addBalanceSpy).toHaveBeenCalledTimes(1);
  });
});
