import { RECOMMENDED_MIN_FEE_VALUE } from "@fleet-sdk/common";
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { BLOCKCHAIN_PARAMETERS, execute } from "./execution";
import { MockChain } from "./mockChain";
import { KeyedMockChainParty } from "./party";
import { checkTransaction } from "./transactionChecks";

const CHAIN_HEIGHT = 1032850;
const CHANGE_ADDRESS = "9hq9HfNKnK1GYHo8fobgDanuMMDnawB9BPw5tWTga3H91tpnTga";

function buildTx(build: (b: TransactionBuilder) => TransactionBuilder) {
  return build(new TransactionBuilder(CHAIN_HEIGHT).from(regularBoxes)).build().toEIP12Object();
}

describe("Transaction checks", () => {
  it("Should pass a well-formed transaction", () => {
    const tx = buildTx((b) => b.sendChangeTo(CHANGE_ADDRESS).payMinFee());
    expect(checkTransaction(tx, BLOCKCHAIN_PARAMETERS)).to.deep.equal([]);
  });

  it("Should reject outputs below the minimum box value", () => {
    const tx = buildTx((b) =>
      b.to(new OutputBuilder(100n, CHANGE_ADDRESS)).sendChangeTo(CHANGE_ADDRESS).payMinFee()
    );

    const errors = checkTransaction(tx, BLOCKCHAIN_PARAMETERS);
    expect(errors).to.have.lengthOf(1);
    expect(errors[0]).to.contain("below the minimum");
  });

  it("Should allow disabling the min box value check", () => {
    const tx = buildTx((b) =>
      b.to(new OutputBuilder(100n, CHANGE_ADDRESS)).sendChangeTo(CHANGE_ADDRESS).payMinFee()
    );

    expect(checkTransaction(tx, BLOCKCHAIN_PARAMETERS, { minBoxValue: false })).to.deep.equal([]);
  });

  it("Should reject transactions without a miner fee output", () => {
    const tx = buildTx((b) =>
      b.to(new OutputBuilder(1000000n, CHANGE_ADDRESS)).sendChangeTo(CHANGE_ADDRESS)
    );

    const errors = checkTransaction(tx, BLOCKCHAIN_PARAMETERS);
    expect(errors).to.have.lengthOf(1);
    expect(errors[0]).to.contain("miner fee");
  });

  it("Should allow disabling the fee check", () => {
    const tx = buildTx((b) =>
      b.to(new OutputBuilder(1000000n, CHANGE_ADDRESS)).sendChangeTo(CHANGE_ADDRESS)
    );

    expect(checkTransaction(tx, BLOCKCHAIN_PARAMETERS, { fee: false })).to.deep.equal([]);
  });

  it("Should accept custom fee trees", () => {
    const chain = new MockChain();
    const miner = new KeyedMockChainParty(chain, "miner");
    const customTree = miner.address.ergoTree;

    const tx = buildTx((b) =>
      b.to(new OutputBuilder(RECOMMENDED_MIN_FEE_VALUE, customTree)).sendChangeTo(CHANGE_ADDRESS)
    );

    expect(checkTransaction(tx, BLOCKCHAIN_PARAMETERS)).to.have.lengthOf(1);
    expect(
      checkTransaction(tx, BLOCKCHAIN_PARAMETERS, { fee: { feeTrees: [customTree] } })
    ).to.deep.equal([]);
  });

  it("Should enforce a custom fee-per-byte threshold", () => {
    const tx = buildTx((b) => b.sendChangeTo(CHANGE_ADDRESS).payMinFee());

    const errors = checkTransaction(tx, BLOCKCHAIN_PARAMETERS, {
      fee: { minFeePerByte: BigInt(1000000) }
    });
    expect(errors).to.have.lengthOf(1);
    expect(errors[0]).to.contain("fee-per-byte");
  });

  it("Should fail execution on check violations", () => {
    const chain = new MockChain();
    const bob = new KeyedMockChainParty(chain, "bob");

    const unsigned = buildTx((b) =>
      b.to(new OutputBuilder(100n, CHANGE_ADDRESS)).sendChangeTo(CHANGE_ADDRESS).payMinFee()
    );

    const result = execute(unsigned, [bob.key]);
    expect(result.success).to.be.false;
    if (!result.success) expect(result.reason.message).to.contain("below the minimum");
  });

  it("Should preserve chain state when execution is rejected", () => {
    const chain = new MockChain();
    const alice = chain.newParty("alice").withBalance({ nanoergs: 100000000n });
    const heightBefore = chain.height;

    const unsigned = new TransactionBuilder(CHAIN_HEIGHT)
      .from(alice.utxos.toArray())
      .to(new OutputBuilder(100n, CHANGE_ADDRESS))
      .sendChangeTo(alice.address)
      .payMinFee()
      .build();

    expect(() => chain.execute(unsigned)).to.throw();
    expect(chain.height).to.equal(heightBefore);
    expect(alice.utxos.length).to.be.greaterThan(0);

    expect(chain.execute(unsigned, { throw: false })).to.be.false;
    expect(chain.height).to.equal(heightBefore);
  });

  it("Should execute a fee-less transaction when the fee check is disabled", () => {
    const chain = new MockChain();
    const alice = chain.newParty("alice").withBalance({ nanoergs: 100000000n });

    const unsigned = new TransactionBuilder(CHAIN_HEIGHT)
      .from(alice.utxos.toArray())
      .to(new OutputBuilder(1000000n, CHANGE_ADDRESS))
      .sendChangeTo(alice.address)
      .build();

    expect(chain.execute(unsigned, { checks: { fee: false } })).to.be.true;
  });
});
