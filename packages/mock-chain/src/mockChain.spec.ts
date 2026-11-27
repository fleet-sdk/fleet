import { first } from "@fleet-sdk/common";
import {
  ErgoBox,
  FEE_CONTRACT,
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE,
  SAFE_MIN_BOX_VALUE,
  TransactionBuilder
} from "@fleet-sdk/core";
import { utf8 } from "@fleet-sdk/crypto";
import { SBool, SByte, SColl } from "@fleet-sdk/serializer";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { MockChain } from "./mockChain";
import { NonKeyedMockChainParty } from "./party";

describe("Mock chain instantiation", () => {
  it("Should create with default parameters", () => {
    const chain = new MockChain();

    expect(chain.height).to.be.equal(1);
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

  it("Should create new party", () => {
    const chain = new MockChain();
    const bob = chain.newParty();

    expect(chain.parties).to.have.length(1);
    expect(chain.parties[0]).to.be.equal(bob);

    const alice = chain.newParty();
    expect(chain.parties).to.have.length(2);
    expect(chain.parties[1]).to.be.equal(alice);
  });

  it("Should add non-keyed party", () => {
    const chain = new MockChain();
    const miner = chain.addParty(FEE_CONTRACT, "Miner Fee");

    expect(miner).to.be.instanceOf(NonKeyedMockChainParty);
    expectTypeOf(miner).toEqualTypeOf<NonKeyedMockChainParty>();
    expect(chain.parties).to.have.length(1);
    expect(chain.parties[0]).to.be.equal(miner);

    const bob = chain.newParty();
    expect(chain.parties).to.have.length(2);
    expect(chain.parties[1]).to.be.equal(bob);
  });

  it("Should clear UTxO set", () => {
    const chain = new MockChain();
    const bob = chain
      .newParty()
      .withBalance({ nanoergs: 1000000n })
      .withBalance({ nanoergs: 19827398237n });
    const alice = chain.newParty().withBalance({ nanoergs: 6000000n });

    expect(bob.utxos).to.have.length(2);
    expect(alice.utxos).to.have.length(1);

    chain.clearUTxOSet();

    expect(bob.utxos).to.have.length(0);
    expect(alice.utxos).to.have.length(0);
  });

  it("Should reset the chain", () => {
    const chain = new MockChain(234897);
    const creationHeight = chain.height;
    const creationTimestamp = chain.timestamp;

    const bob = chain
      .newParty()
      .withBalance({ nanoergs: 1000000n })
      .withBalance({ nanoergs: 19827398237n });
    const alice = chain.newParty().withBalance({ nanoergs: 6000000n });

    expect(bob.utxos).to.have.length(2);
    expect(alice.utxos).to.have.length(1);

    chain.newBlocks(100);

    expect(chain.height).to.be.greaterThan(creationHeight);
    expect(chain.timestamp).to.be.greaterThan(creationTimestamp);

    // reset the chain
    chain.reset();

    // should clear and reset state to original values
    expect(chain.parties).to.have.length(2); // parties should not be cleared by default
    expect(chain.height).to.be.equal(creationHeight);
    expect(chain.timestamp).to.be.equal(creationTimestamp);
    expect(bob.utxos).to.have.length(0);
    expect(alice.utxos).to.have.length(0);
  });

  it("Should reset the chain and clean up the parties", () => {
    const chain = new MockChain(234897);
    const creationHeight = chain.height;
    const creationTimestamp = chain.timestamp;

    const bob = chain
      .newParty()
      .withBalance({ nanoergs: 1000000n })
      .withBalance({ nanoergs: 19827398237n });
    const alice = chain.newParty().withBalance({ nanoergs: 6000000n });

    expect(bob.utxos).to.have.length(2);
    expect(alice.utxos).to.have.length(1);

    chain.newBlocks(100);

    expect(chain.height).to.be.greaterThan(creationHeight);
    expect(chain.timestamp).to.be.greaterThan(creationTimestamp);

    // reset the chain
    chain.reset({ clearParties: true });

    // should clear and reset state to original values
    expect(chain.parties).to.have.length(0); // parties should be cleared
    expect(chain.height).to.be.equal(creationHeight);
    expect(chain.timestamp).to.be.equal(creationTimestamp);
    expect(bob.utxos).to.have.length(0);
    expect(alice.utxos).to.have.length(0);

    bob.addBalance({ nanoergs: 1000000n });
    expect(bob.utxos).to.have.length(1); // parties should be re-added after adding balance
    expect(chain.parties).to.have.length(1);
  });

  it("Should simulate new blocks", () => {
    const blockTime = 120_000;
    const height = 100;
    const timestamp = new Date().getTime();

    const chain = new MockChain({ height, timestamp });
    expect(chain.height).to.be.equal(height);
    expect(chain.timestamp).to.be.equal(timestamp);

    chain.newBlock(); // +1 block
    expect(chain.height).to.be.equal(height + 1);
    expect(chain.timestamp).to.be.equal(timestamp + 1 * blockTime);

    chain.newBlocks(10); // +10 blocks
    expect(chain.height).to.be.equal(111);
    expect(chain.timestamp).to.be.equal(timestamp + 11 * blockTime);

    chain.jumpTo(250); // jump to block 250
    expect(chain.height).to.be.equal(250);
    expect(chain.timestamp).to.be.equal(timestamp + 150 * blockTime);
  });
});

describe("Contract execution and chain mocking", () => {
  const consoleMock = vi.spyOn(console, "log").mockImplementation(() => {
    return;
  });

  const SIGUSD_TOKEN_ID = "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04";
  const SIGRSV_TOKEN_ID = "003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0";

  afterEach(() => {
    consoleMock.mockReset();
  });

  it("Should execute execute transaction and log diff", () => {
    const params = { height: 38478, timestamp: new Date().getTime() };
    const chain = new MockChain(params);

    chain.assetsMetadata.set("nanoerg", { decimals: 9, name: "ERG" });
    chain.assetsMetadata.set(SIGUSD_TOKEN_ID, { decimals: 2, name: "SigUSD" });
    chain.assetsMetadata.set(SIGRSV_TOKEN_ID, { name: "SigRSV" });

    const bob = chain.newParty("Bob").withBalance({
      nanoergs: 1000000000n,
      tokens: [
        { tokenId: SIGUSD_TOKEN_ID, amount: 23984784n },
        { tokenId: SIGRSV_TOKEN_ID, amount: 60000000n }
      ]
    });
    const alice = chain.newParty("Alice");
    chain.newParty({ name: "Miner Fee Contract", ergoTree: FEE_CONTRACT });

    const sendAmount = SAFE_MIN_BOX_VALUE * 3n;
    const fee = RECOMMENDED_MIN_FEE_VALUE;

    const unsignedTransaction = new TransactionBuilder(2)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(sendAmount, alice.address).addTokens({
          tokenId: SIGUSD_TOKEN_ID,
          amount: 100n
        })
      )
      .sendChangeTo(bob.address)
      .payFee(fee)
      .build();

    expect(chain.height).to.be.equal(params.height);
    expect(chain.timestamp).to.be.equal(params.timestamp);

    expect(bob.balance).to.be.deep.equal({
      nanoergs: 1000000000n,
      tokens: [
        { tokenId: SIGUSD_TOKEN_ID, amount: 23984784n },
        { tokenId: SIGRSV_TOKEN_ID, amount: 60000000n }
      ]
    });
    expect(alice.balance).to.be.deep.equal({ nanoergs: 0n, tokens: [] });

    expect(chain.execute(unsignedTransaction, { log: true })).to.be.true;

    expect(bob.balance).to.be.deep.equal({
      nanoergs: 1000000000n - sendAmount - fee,
      tokens: [
        { tokenId: SIGUSD_TOKEN_ID, amount: 23984684n },
        { tokenId: SIGRSV_TOKEN_ID, amount: 60000000n }
      ]
    });
    expect(alice.balance).to.be.deep.equal({
      nanoergs: sendAmount,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 100n }]
    });

    expect(chain.height).to.be.equal(params.height + 1); // + 1 block
    expect(chain.timestamp - params.timestamp).to.be.equal(120000); // + 2 min

    expect(consoleMock).toHaveBeenCalledWith("State changes:\n");
  });

  it("Should execute transaction but not log", () => {
    const chain = new MockChain();

    const bob = chain.newParty().withBalance({
      nanoergs: 1000000000n,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 1000n }]
    });
    const alice = chain.newParty();

    const unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address).addTokens({
          tokenId: SIGUSD_TOKEN_ID,
          amount: 100n
        })
      )
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    expect(chain.execute(unsignedTransaction)).to.be.true;

    expect(bob.balance).to.be.deep.equal({
      nanoergs: 1000000000n - RECOMMENDED_MIN_FEE_VALUE - SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 900n }]
    });
    expect(alice.balance).to.be.deep.equal({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 100n }]
    });

    expect(consoleMock).not.toBeCalled();
  });

  it("Should execute from eip-12 unsigned transaction object", () => {
    const chain = new MockChain();

    const bob = chain.newParty().withBalance({
      nanoergs: 1000000000n,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 1000n }]
    });
    const alice = chain.newParty();

    const unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address).addTokens({
          tokenId: SIGUSD_TOKEN_ID,
          amount: 100n
        })
      )
      .sendChangeTo(bob.address)
      .payMinFee()
      .build()
      .toEIP12Object();

    expect(() => chain.execute(unsignedTransaction)).not.to.throw();
  });

  it("Should execute burning transaction", () => {
    const chain = new MockChain();

    const bob = chain.newParty().withBalance({
      nanoergs: 1000000000n,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 1000n }]
    });

    const unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .burnTokens({ tokenId: SIGUSD_TOKEN_ID, amount: 1n })
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    expect(chain.execute(unsignedTransaction)).to.be.true;

    expect(bob.balance).to.be.deep.equal({
      nanoergs: 1000000000n - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 999n }]
    });
  });

  it("Should execute minting transaction", () => {
    const chain = new MockChain();
    const bob = chain.newParty().withBalance({ nanoergs: 1000000000n });
    const unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, bob.address).mintToken({
          amount: 1000n,
          name: "Test Token",
          decimals: 2
        })
      )
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    const tokenId = first(unsignedTransaction.inputs).boxId;
    expect(chain.execute(unsignedTransaction)).to.be.true;
    expect(bob.utxos).to.have.length(2);
    expect(bob.balance).to.be.deep.equal({
      nanoergs: 1000000000n - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [{ tokenId, amount: 1000n }]
    });

    expect(chain.assetsMetadata.get(tokenId)).to.be.deep.equal({
      name: "Test Token",
      decimals: 2
    });
  });

  it("Should update balance after execution", () => {
    const chain = new MockChain();

    const alice = chain.newParty();
    const bob = chain
      .newParty()
      .withBalance({
        nanoergs: 1000000000n,
        tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 1000n }]
      })
      .withBalance({
        nanoergs: 2000000000n,
        tokens: [{ tokenId: SIGUSD_TOKEN_ID, amount: 2000n }]
      });

    expect(bob.utxos).to.have.length(2);
    expect(alice.utxos).to.have.length(0);

    const unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address).addTokens({
          tokenId: SIGUSD_TOKEN_ID,
          amount: 1500n
        })
      )
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    expect(chain.execute(unsignedTransaction)).to.be.true;

    expect(bob.utxos).to.have.length(1);
    expect(bob.balance).to.be.deep.equal({
      nanoergs: 2997900000n,
      tokens: [
        {
          amount: 1500n,
          tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04"
        }
      ]
    });

    expect(alice.utxos).to.have.length(1);
    expect(alice.balance).to.be.deep.equal({
      nanoergs: 1000000n,
      tokens: [
        {
          amount: 1500n,
          tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04"
        }
      ]
    });
  });

  it("Should add minting token metadata to assetMetadataMap", () => {
    const chain = new MockChain();
    const bob = chain.newParty().withBalance({ nanoergs: 1000000000n });

    let unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, bob.address).mintToken({
          amount: 1000n,
          name: "Test Token 1",
          decimals: 2
        })
      )
      .sendChangeTo(bob.address)
      .build();

    let tokenId = first(unsignedTransaction.inputs).boxId;
    expect(chain.execute(unsignedTransaction)).to.be.true;
    expect(chain.assetsMetadata.get(tokenId)).to.be.deep.equal({
      name: "Test Token 1",
      decimals: 2
    });

    unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, bob.address).mintToken({
          amount: 1000n,
          name: "Test Token 2"
        })
      )
      .sendChangeTo(bob.address)
      .build();

    tokenId = first(unsignedTransaction.inputs).boxId;
    expect(chain.execute(unsignedTransaction)).to.be.true;
    expect(chain.assetsMetadata.get(tokenId)).to.be.deep.equal({
      name: "Test Token 2",
      decimals: 0
    });

    unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, bob.address).mintToken({
          amount: 1000n
        })
      )
      .sendChangeTo(bob.address)
      .build();

    tokenId = first(unsignedTransaction.inputs).boxId;
    expect(chain.execute(unsignedTransaction)).to.be.true;
    expect(chain.assetsMetadata.get(tokenId)).to.be.equal(undefined);

    unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, bob.address)
          .mintToken({
            amount: 1000n
          })
          .setAdditionalRegisters({
            R4: SColl(SByte, utf8.decode("Test Token 4")).toHex()
          })
      )
      .sendChangeTo(bob.address)
      .build();

    tokenId = first(unsignedTransaction.inputs).boxId;
    expect(chain.execute(unsignedTransaction)).to.be.true;
    expect(chain.assetsMetadata.get(tokenId)).to.be.deep.equal({
      name: "Test Token 4",
      decimals: undefined
    });

    unsignedTransaction = new TransactionBuilder(38479)
      .from(bob.utxos.toArray())
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, bob.address)
          .mintToken({
            amount: 1000n
          })
          .setAdditionalRegisters({
            R4: SColl(SByte, utf8.decode("Test Token 5")).toHex(),
            R5: SColl(SByte, utf8.decode("")).toHex(),
            R6: SBool(false).toHex() // non standard, should not throw on parsing
          })
      )
      .sendChangeTo(bob.address)
      .build();

    tokenId = first(unsignedTransaction.inputs).boxId;
    expect(chain.execute(unsignedTransaction)).to.be.true;
    expect(chain.assetsMetadata.get(tokenId)).to.be.deep.equal({
      name: "Test Token 5",
      decimals: undefined
    });
  });

  it("Should fail with wrong keys", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => {
      return;
    });

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

    // should throw by default
    expect(() => chain.execute(unsignedTransaction, { signers: [alice] })).to.throw();

    // should throw if { throw: true }
    expect(() => chain.execute(unsignedTransaction, { signers: [alice], throw: true })).to.throw(
      "Tree root should be real but was UnprovenSchnorr"
    );

    // should not throw if { throw: false }
    expect(() =>
      chain.execute(unsignedTransaction, { signers: [alice], throw: false })
    ).not.to.throw();

    // log error message if { log: true }
    expect(() =>
      chain.execute(unsignedTransaction, { signers: [alice], log: true, throw: false })
    ).not.to.throw();

    expect(consoleMock.mock.calls[0][0]).to.include(
      "AssertionError: assertion failed: Tree root should be real but was UnprovenSchnorr"
    );

    // should not affect balances
    expect(bob.balance).to.be.deep.equal({ nanoergs: 1000000000n, tokens: [] });
    expect(alice.balance).to.be.deep.equal({ nanoergs: 0n, tokens: [] });

    expect(chain.height).to.be.equal(params.height);
    expect(chain.timestamp - params.timestamp).to.be.equal(0);
  });

  it("Should merge partial blockchain parameters with defaults", () => {
    const chain = new MockChain({ parameters: { minValuePerByte: 500 } });
    const bob = chain.newParty().withBalance({ nanoergs: 1000000000n });
    const alice = chain.newParty();

    const unsignedTransaction = new TransactionBuilder(chain.height)
      .from(bob.utxos.toArray())
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address))
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    expect(chain.execute(unsignedTransaction)).to.be.true;

    const lowCostChain = new MockChain({ parameters: { maxBlockCost: 1 } });
    const charlie = lowCostChain.newParty().withBalance({ nanoergs: 1000000000n });
    const dave = lowCostChain.newParty();

    const lowCostTx = new TransactionBuilder(lowCostChain.height)
      .from(charlie.utxos.toArray())
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, dave.address))
      .sendChangeTo(charlie.address)
      .payMinFee()
      .build();

    expect(lowCostChain.execute(lowCostTx, { throw: false })).to.be.false;
  });

  it("Should assign shared transactionId and sequential output indices to created boxes", () => {
    const chain = new MockChain(100);
    const bob = chain.newParty("Bob").withBalance({ nanoergs: 1000000000n });
    const alice = chain.newParty("Alice");
    const miner = chain.addParty(FEE_CONTRACT, "Miner");

    const tx1 = new TransactionBuilder(chain.height)
      .from(bob.utxos.toArray())
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address))
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    expect(chain.execute(tx1)).to.be.true;

    const aliceBox1 = alice.utxos.at(0);
    const minerBox1 = miner.utxos.at(0);
    const bobBox1 = bob.utxos.at(0);

    expect(aliceBox1.transactionId).to.be.equal(tx1.id);
    expect(minerBox1.transactionId).to.be.equal(tx1.id);
    expect(bobBox1.transactionId).to.be.equal(tx1.id);

    expect(aliceBox1.index).to.be.equal(0);
    expect(minerBox1.index).to.be.equal(1);
    expect(bobBox1.index).to.be.equal(2);

    expect(aliceBox1.boxId).to.be.equal(tx1.outputs[0].boxId);
    expect(minerBox1.boxId).to.be.equal(tx1.outputs[1].boxId);
    expect(bobBox1.boxId).to.be.equal(tx1.outputs[2].boxId);

    expect(ErgoBox.validate(aliceBox1)).to.be.true;
    expect(ErgoBox.validate(minerBox1)).to.be.true;
    expect(ErgoBox.validate(bobBox1)).to.be.true;

    const tx2 = new TransactionBuilder(chain.height)
      .from(bob.utxos.toArray())
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address))
      .sendChangeTo(bob.address)
      .payMinFee()
      .build();

    expect(chain.execute(tx2.toEIP12Object())).to.be.true;

    const aliceBox2 = alice.utxos.at(1);
    const minerBox2 = miner.utxos.at(1);
    const bobBox2 = bob.utxos.at(0);

    expect(aliceBox2.transactionId).to.be.equal(tx2.id);
    expect(minerBox2.transactionId).to.be.equal(tx2.id);
    expect(bobBox2.transactionId).to.be.equal(tx2.id);

    expect(aliceBox2.index).to.be.equal(0);
    expect(minerBox2.index).to.be.equal(1);
    expect(bobBox2.index).to.be.equal(2);

    expect(aliceBox2.boxId).to.be.equal(tx2.outputs[0].boxId);
    expect(minerBox2.boxId).to.be.equal(tx2.outputs[1].boxId);
    expect(bobBox2.boxId).to.be.equal(tx2.outputs[2].boxId);

    expect(ErgoBox.validate(aliceBox2)).to.be.true;
    expect(ErgoBox.validate(minerBox2)).to.be.true;
    expect(ErgoBox.validate(bobBox2)).to.be.true;
  });
});
