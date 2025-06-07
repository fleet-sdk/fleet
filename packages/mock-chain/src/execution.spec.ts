import { TransactionBuilder } from "@fleet-sdk/core";
import type { ErgoHDKey } from "@fleet-sdk/wallet";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { execute } from "./execution";
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
      .build()
      .toEIP12Object();

    expect(bob.key).not.to.be.undefined;
    const bobKey = bob.key;
    expect(() => execute(unsigned, [bobKey])).not.to.throw();
    expect(execute(unsigned, [bobKey])).to.contain({ success: false });
  });

  it("Should throw if private key is missing", () => {
    const key = new KeyedMockChainParty(chain, "bob").key.wipePrivateData() as ErgoHDKey;
    const unsigned = new TransactionBuilder(1032850)
      .from(regularBoxes)
      .sendChangeTo("9hq9HfNKnK1GYHo8fobgDanuMMDnawB9BPw5tWTga3H91tpnTga")
      .payMinFee()
      .build()
      .toEIP12Object();

    expect(key.isNeutered()).to.be.true;
    expect(() => execute(unsigned, [key])).to.throw();
  });

  it("Should execute transaction", () => {
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
      .build()
      .toEIP12Object();

    expect(bob.key).not.to.be.undefined;
    const bobKey = bob.key as ErgoHDKey;
    expect(execute(unsigned, [bobKey])).to.contain({ success: true });
  });
});
