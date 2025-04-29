import { first } from "@fleet-sdk/common";
import {
  FEE_CONTRACT,
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE,
  SAFE_MIN_BOX_VALUE,
  TransactionBuilder
} from "@fleet-sdk/core";
import { utf8 } from "@fleet-sdk/crypto";
import { SBool, SByte, SColl } from "@fleet-sdk/serializer";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(chain.height).to.be.equal(creationHeight);
    expect(chain.timestamp).to.be.equal(creationTimestamp);
    expect(bob.utxos).to.have.length(0);
    expect(alice.utxos).to.have.length(0);
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

  const SIGUSD_TOKEN_ID =
    "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04";
  const SIGRSV_TOKEN_ID =
    "003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0";

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

  it("Should should execute transaction but not log", () => {
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

  it("Should should execute minting transaction", () => {
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
    expect(() =>
      chain.execute(unsignedTransaction, { signers: [alice], throw: true })
    ).to.throw("Tree root should be real but was UnprovenSchnorr");

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
});
