import { ErgoAddress, FEE_CONTRACT } from "@fleet-sdk/core";
import { describe, expect, it } from "vitest";
import { MockChain } from "../mockChain";
import { NonKeyedMockChainParty } from "./nonKeyedMockChainParty";

describe("Keyed mock chain party", () => {
  const chain = new MockChain();
  it("Should create a non-keyed party", () => {
    const nonKeyedNamedParty = new NonKeyedMockChainParty(
      chain,
      FEE_CONTRACT,
      "miner"
    );
    const address = ErgoAddress.fromErgoTree(FEE_CONTRACT);

    expect(nonKeyedNamedParty.name).to.be.equal("miner");
    expect(nonKeyedNamedParty.utxos).to.have.length(0);
    expect(nonKeyedNamedParty.address.encode()).to.be.equal(address.encode());
    expect(nonKeyedNamedParty.ergoTree).to.be.equal(FEE_CONTRACT);
    expect(nonKeyedNamedParty.ergoTree).to.be.equal(
      nonKeyedNamedParty.address.ergoTree
    );

    const nonKeyedUnnamedParty = new NonKeyedMockChainParty(
      chain,
      FEE_CONTRACT
    );
    expect(nonKeyedUnnamedParty.name).to.be.equal(
      nonKeyedUnnamedParty.address.encode()
    );
  });

  it("Should throw if creating a non-keyed party without an ErgoTree", () => {
    expect(
      () => new NonKeyedMockChainParty(chain, {} as unknown as string)
    ).to.throw("A non-keyed party needs a valid ErgoTree to be instantiated.");
  });
});
