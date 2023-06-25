import {
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE,
  SAFE_MIN_BOX_VALUE,
  TransactionBuilder
} from "@fleet-sdk/core";
import { describe, expect, it } from "vitest";
import { MockChain } from "./mockChain";

describe("Mock chain instantiation", () => {
  it("Should create with default parameters", () => {
    const chain = new MockChain();

    expect(chain.height).to.be.equal(0);
    expect(chain.timestamp).to.be.closeTo(new Date().getTime(), 100);
    expect(chain.parties).to.have.length(0);
  });

  it("Should create with custom parameters", () => {
    const customHeightChain = new MockChain(10);
    expect(customHeightChain.height).to.be.equal(10);
    expect(customHeightChain.timestamp).to.be.closeTo(new Date().getTime(), 100);

    const params = { height: 1231, timestamp: new Date().getTime() };
    const customParamsChain = new MockChain(params);
    expect(customParamsChain.height).to.be.equal(params.height);
    expect(customParamsChain.timestamp).to.be.equal(params.timestamp);
  });

  it("Should add party", () => {
    const chain = new MockChain();
    const bob = chain.newParty();

    expect(chain.parties).to.have.length(1);
    expect(chain.parties[0]).to.be.equal(bob);

    const alice = chain.newParty();
    expect(chain.parties).to.have.length(2);
    expect(chain.parties[1]).to.be.equal(alice);
  });
});

describe("Execution", () => {
  it("Should execute execute transaction", () => {
    const params = { height: 38478, timestamp: new Date().getTime() };
    const chain = new MockChain(params);
    const bob = chain.newParty().withBalance({ nanoergs: 1000000000n });
    const alice = chain.newParty();

    const sendAmount = SAFE_MIN_BOX_VALUE * 3n;
    const fee = RECOMMENDED_MIN_FEE_VALUE;

    const unsignedTransaction = new TransactionBuilder(2)
      .from(bob.utxos.toArray())
      .to(new OutputBuilder(sendAmount, alice.address))
      .sendChangeTo(bob.address)
      .payFee(fee)
      .build();

    expect(chain.height).to.be.equal(params.height);
    expect(chain.timestamp).to.be.equal(params.timestamp);

    expect(bob.balance).to.be.deep.equal({ nanoergs: 1000000000n, tokens: [] });
    expect(alice.balance).to.be.deep.equal({ nanoergs: 0n, tokens: [] });

    expect(chain.execute(unsignedTransaction)).to.be.true;

    expect(bob.balance).to.be.deep.equal({ nanoergs: 1000000000n - sendAmount - fee, tokens: [] });
    expect(alice.balance).to.be.deep.equal({ nanoergs: sendAmount, tokens: [] });

    expect(chain.height).to.be.equal(params.height + 1); // + 1 block
    expect(chain.timestamp - params.timestamp).to.be.equal(120000); // + 2 min
  });

  it("Should fail with wrong keys", () => {
    const params = { height: 38478, timestamp: new Date().getTime() };
    const chain = new MockChain(params);
    const bob = chain.newParty().withBalance({ nanoergs: 1000000000n });
    const alice = chain.newParty();

    const sendAmount = SAFE_MIN_BOX_VALUE * 3n;
    const fee = RECOMMENDED_MIN_FEE_VALUE;

    const unsignedTransaction = new TransactionBuilder(2)
      .from(bob.utxos.toArray())
      .to(new OutputBuilder(sendAmount, alice.address))
      .sendChangeTo(bob.address)
      .payFee(fee)
      .build();

    // fail but not throw
    expect(chain.execute(unsignedTransaction, { signers: [alice] })).to.be.false;

    // throw if { throw: true }
    expect(() => chain.execute(unsignedTransaction, { signers: [alice], throw: true })).to.throw();

    // should not change
    expect(bob.balance).to.be.deep.equal({ nanoergs: 1000000000n, tokens: [] });
    expect(alice.balance).to.be.deep.equal({ nanoergs: 0n, tokens: [] });

    expect(chain.height).to.be.equal(params.height);
    expect(chain.timestamp - params.timestamp).to.be.equal(0);
  });
});
