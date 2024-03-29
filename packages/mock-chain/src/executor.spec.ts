import { TransactionBuilder } from "@fleet-sdk/core";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { execute } from "./executor";
import { MockChain } from "./mockChain";
import { mockUTxO } from "./objectMocking";
import { KeyedMockChainParty } from "./party";

describe("Transaction executor", () => {
  const chain = new MockChain();

  it("Should not execute transaction, invalid private key", () => {
    const bob = new KeyedMockChainParty(chain, "bob");
    const unsigned = new TransactionBuilder(1032850)
      .from(regularBoxes)
      .sendChangeTo("9hq9HfNKnK1GYHo8fobgDanuMMDnawB9BPw5tWTga3H91tpnTga")
      .payMinFee()
      .build();

    expect(bob.key).not.to.be.undefined;
    const bobKey = bob.key;
    expect(() => execute(unsigned, [bobKey])).not.to.throw();
    expect(execute(unsigned, [bobKey])).to.contain({ success: false });
  });

  it("Should not execute transaction", () => {
    const bob = new KeyedMockChainParty(chain, "bob");
    const input = mockUTxO({
      ergoTree: bob.address.ergoTree,
      value: 10000000n,
      assets: [],
      creationHeight: 10328490,
      additionalRegisters: {}
    });

    const unsigned = new TransactionBuilder(1032850)
      .from(input)
      .sendChangeTo("9hq9HfNKnK1GYHo8fobgDanuMMDnawB9BPw5tWTga3H91tpnTga")
      .payMinFee()
      .build();

    expect(bob.key).not.to.be.undefined;
    const bobKey = bob.key as ErgoHDKey;
    expect(execute(unsigned, [bobKey])).to.contain({ success: true });
  });
});
