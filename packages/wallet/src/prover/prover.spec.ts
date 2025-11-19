import {
  ErgoMessage,
  Network,
  OutputBuilder,
  SGroupElement,
  SSigmaProp,
  TransactionBuilder
} from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { Address, verify_signature } from "ergo-lib-wasm-nodejs";
import { describe, expect, it } from "vitest";
import { mockUTxO } from "../../../mock-chain/src"; // let's avoid circular dependencies
import { ErgoHDKey } from "../ergoHDKey";
import { generateMnemonic } from "../mnemonic";
import { Prover } from "./prover";

const height = 1234209;
const externalAddress = "9gN8gmyaDBuWPZLn8zj9uZxnLUj4TE9rtedtLGNjf6cUhTmoTwc";

const toBytes = (input: string | undefined | null) => hex.decode(input ?? "");

describe("Transaction signing", () => {
  it("Should sign a transaction with a single secret and a single input", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // mock inputs
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: rootKey.address.ergoTree
    });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx, [rootKey]);

    // verify
    const proof = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);

    // verify using own verifier
    expect(prover.verify(unsignedTx, proof, rootKey)).to.be.true;

    // verify using sigma-rust for comparison
    const txBytes = unsignedTx.toBytes();
    const addr = Address.from_public_key(rootKey.publicKey);
    expect(verify_signature(addr, txBytes, proof)).to.be.true;
  });

  it("Should sign a transaction with a single secret and a single input and data input", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // mock inputs
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: rootKey.address.ergoTree
    });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .withDataFrom(mockUTxO({ ergoTree: rootKey.address.ergoTree }))
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx, [rootKey]);

    // verify
    const proof = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);

    // verify using own verifier
    expect(prover.verify(unsignedTx, proof, rootKey)).to.be.true;

    // verify using sigma-rust for comparison
    const txBytes = unsignedTx.toBytes();
    const addr = Address.from_public_key(rootKey.publicKey);
    expect(verify_signature(addr, txBytes, proof)).to.be.true;
  });

  it("Should determine key from registers", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);

    // mock inputs
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: "190600e4c6a70408" /** SELF.R4[SigmaProp].get */,
      additionalRegisters: {
        R4: SSigmaProp(SGroupElement(child1.publicKey)).toHex()
      }
    });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx, [rootKey, child1]);

    // verify
    const proof = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);

    // verify using own verifier
    expect(prover.verify(unsignedTx, proof, child1)).to.be.true;

    // verify using sigma-rust for comparison
    const txBytes = unsignedTx.toBytes();
    const addr = Address.from_public_key(child1.publicKey);
    expect(verify_signature(addr, txBytes, proof)).to.be.true;
  });

  it("Should select corresponding key and sign a transaction with multiple secrets and a single input", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);
    const child2 = rootKey.deriveChild(2);

    // mock inputs
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: rootKey.address.ergoTree
    });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx.toEIP12Object(), [rootKey, child1, child2]);

    // verify
    const proof = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);

    // verify using own verifier
    expect(prover.verify(unsignedTx, proof, rootKey)).to.be.true;

    // verify using sigma-rust for comparison
    const txBytes = unsignedTx.toBytes();
    const addr = Address.from_public_key(rootKey.publicKey);
    expect(verify_signature(addr, txBytes, proof)).to.be.true;
  });

  it("Should select corresponding key and sign a transaction with multiple secrets and multiple inputs", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);
    const child2 = rootKey.deriveChild(2);

    // mock inputs
    const inputs = [
      mockUTxO({ value: 1_000_000_000n, ergoTree: rootKey.address.ergoTree }),
      mockUTxO({ value: 1_000_000_000n, ergoTree: child2.address.ergoTree })
    ];

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .configureSelector((selector) => selector.ensureInclusion("all")) // ensure the inclusion of all inputs
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx.toEIP12Object(), [rootKey, child1, child2]);

    // verify
    const txBytes = unsignedTx.toBytes();
    const proof0 = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);
    const proof1 = toBytes(signedTx.inputs[1].spendingProof?.proofBytes);

    // verify using own verifier
    expect(prover.verify(txBytes, proof0, rootKey)).to.be.true;
    expect(prover.verify(txBytes, proof1, child2)).to.be.true;

    // verify using sigma-rust for comparison
    const addr1 = Address.from_public_key(rootKey.publicKey);
    expect(verify_signature(addr1, txBytes, proof0)).to.be.true;
    const addr2 = Address.from_public_key(child2.publicKey);
    expect(verify_signature(addr2, txBytes, proof1)).to.be.true;
  });

  it("Should use mapper to force input signing by a selected secret and fallback to _", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);
    const child2 = rootKey.deriveChild(2);
    const child3 = rootKey.deriveChild(3);

    // mock inputs
    const inputs = [
      mockUTxO({ value: 1_000_000_000n, ergoTree: rootKey.address.ergoTree }),
      mockUTxO({ value: 1_000_000_000n, ergoTree: child2.address.ergoTree }),
      mockUTxO({ value: 1_000_000_000n, ergoTree: child1.address.ergoTree })
    ];

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .configureSelector((selector) => selector.ensureInclusion("all")) // ensure the inclusion of all inputs
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx.toEIP12Object(), {
      0: child2, // input 0 will be signed by child2,
      1: rootKey, // input 1 will be signed by rootKey,
      _: [child1, child3] // every other input will be signed by child1 and child3 as necessary
    });

    // verify
    const txBytes = unsignedTx.toBytes();
    const proof0 = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);
    const proof1 = toBytes(signedTx.inputs[1].spendingProof?.proofBytes);
    const proof2 = toBytes(signedTx.inputs[2].spendingProof?.proofBytes);

    expect(prover.verify(txBytes, proof0, rootKey)).to.be.false; // inverted by the mapper
    expect(prover.verify(txBytes, proof0, child2)).to.be.true; // inverted by the mapper

    expect(prover.verify(txBytes, proof1, child2)).to.be.false; // inverted by the mapper
    expect(prover.verify(txBytes, proof1, rootKey)).to.be.true; // inverted by the mapper

    expect(prover.verify(txBytes, proof2, child1)).to.be.true; // not inverted by the mapper
  });

  it("Should use mapper to force input signing by a selected secret, no fallback", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);

    // mock inputs
    const inputs = [
      mockUTxO({ value: 1_000_000_000n, ergoTree: rootKey.address.ergoTree }),
      mockUTxO({ value: 1_000_000_000n, ergoTree: child1.address.ergoTree })
    ];

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .configureSelector((selector) => selector.ensureInclusion("all")) // ensure the inclusion of all inputs
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx.toEIP12Object(), {
      0: child1, // input 0 will be signed by child2,
      1: rootKey // input 1 will be signed by rootKey,
    });

    // verify
    const txBytes = unsignedTx.toBytes();
    const proof0 = toBytes(signedTx.inputs[0].spendingProof?.proofBytes);
    const proof1 = toBytes(signedTx.inputs[1].spendingProof?.proofBytes);

    expect(prover.verify(txBytes, proof0, rootKey)).to.be.false; // inverted by the mapper
    expect(prover.verify(txBytes, proof0, child1)).to.be.true; // inverted by the mapper

    expect(prover.verify(txBytes, proof1, child1)).to.be.false; // inverted by the mapper
    expect(prover.verify(txBytes, proof1, rootKey)).to.be.true; // inverted by the mapper
  });

  it("Should throw if no corresponding key is found", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);
    const child2 = rootKey.deriveChild(2);

    // mock inputs
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: rootKey.address.ergoTree
    });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    const prover = new Prover();
    expect(() => prover.signTransaction(unsignedTx, [child1, child2])).to.throw(
      "Unable to find the corresponding secret for the input 0:"
    );
  });

  it("Should sign a transaction with a single secret and a multiple inputs", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // mock inputs
    const inputs = Array.from({ length: 10 }).map((_, index) =>
      mockUTxO({
        value: 1_000_000_000n * BigInt(index + 1),
        ergoTree: rootKey.address.ergoTree
      })
    );

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .configureSelector((selector) => selector.ensureInclusion("all")) // ensure the inclusion of all inputs
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    // verify if all inputs are included
    expect(unsignedTx.inputs.length).to.be.equal(10);

    // sign
    const prover = new Prover();
    const signedTx = prover.signTransaction(unsignedTx, [rootKey]);

    // verify
    const txBytes = unsignedTx.toBytes();

    // verify all inputs using own verifier
    for (const input of signedTx.inputs) {
      const proof = toBytes(input.spendingProof?.proofBytes);
      expect(prover.verify(txBytes, proof, rootKey)).to.be.true;
    }

    // verify all inputs using sigma-rust for comparison
    const addr = Address.from_public_key(rootKey.publicKey);
    for (const input of signedTx.inputs) {
      const proof = toBytes(input.spendingProof?.proofBytes);
      expect(verify_signature(addr, txBytes, proof)).to.be.true;
    }
  });

  it("Should throw when trying to sign without a secret key", async () => {
    const key = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const neuteredKey = key.wipePrivateData();

    // mock inputs
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: neuteredKey.address.ergoTree
    });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .sendChangeTo(neuteredKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    expect(() =>
      prover.signTransaction(unsignedTx.toEIP12Object(), [neuteredKey as ErgoHDKey])
    ).to.throw("Private key is not present");
  });
});

describe("Transaction proof verification", () => {
  // generate keys
  const rootKey = ErgoHDKey.fromMnemonicSync(generateMnemonic());

  // mock inputs
  const input = mockUTxO({
    value: 1_000_000_000n,
    ergoTree: rootKey.address.ergoTree
  });

  // build the unsigned transaction
  const unsignedTx = new TransactionBuilder(height)
    .from(input)
    .to(new OutputBuilder(10_000_000n, externalAddress))
    .sendChangeTo(rootKey.address)
    .payMinFee()
    .build();

  // sign
  const signedTx = new Prover().signTransaction(unsignedTx, [rootKey]);

  it("Should verify from bytes", () => {
    const prover = new Prover();
    const proof = signedTx.inputs[0].spendingProof?.proofBytes ?? "";

    expect(prover.verify(unsignedTx.toBytes(), proof, rootKey)).to.be.true;
  });

  it("Should verify from hex", () => {
    const prover = new Prover();
    const proof = signedTx.inputs[0].spendingProof?.proofBytes ?? "";

    expect(prover.verify(hex.encode(unsignedTx.toBytes()), proof, rootKey)).to.be.true;
  });

  it("Should verify from SignedTransaction", () => {
    const prover = new Prover();
    const proof = signedTx.inputs[0].spendingProof?.proofBytes ?? "";

    expect(prover.verify(signedTx, proof, rootKey)).to.be.true;
  });

  it("Should verify from ErgoUnsignedTransaction", () => {
    const prover = new Prover();
    const proof = signedTx.inputs[0].spendingProof?.proofBytes ?? "";

    expect(prover.verify(unsignedTx, proof, rootKey)).to.be.true;
  });

  it("Should verify from EIP12UnsignedTransaction", () => {
    const prover = new Prover();
    const proof = signedTx.inputs[0].spendingProof?.proofBytes ?? "";

    expect(prover.verify(unsignedTx.toEIP12Object(), proof, rootKey)).to.be.true;
  });

  it("Should verify from PlainObject", () => {
    const prover = new Prover();
    const proof = signedTx.inputs[0].spendingProof?.proofBytes ?? "";

    expect(prover.verify(unsignedTx.toPlainObject(), proof, rootKey)).to.be.true;
  });
});

describe("Message proof verification", () => {
  const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());

  it("Should verify from bytes", () => {
    const prover = new Prover();
    const message = ErgoMessage.fromData("hello world");
    const proof = prover.signMessage(message, key);

    expect(prover.verify(message.serialize().toBytes(), proof, key)).to.be.true;
  });

  it("Should verify from hex", () => {
    const prover = new Prover();
    const message = ErgoMessage.fromData("hello world");
    const proof = prover.signMessage(message, key);

    expect(prover.verify(message.serialize().encode(hex), hex.encode(proof), key)).to.be.true;
  });

  it("Should verify from ErgoMessage", () => {
    const prover = new Prover();
    const message = ErgoMessage.fromData("hello world");
    const proof = prover.signMessage(message, key);

    expect(prover.verify(message, proof, key.publicKey)).to.be.true;
  });

  it("Should verify from Base58String", () => {
    const prover = new Prover();
    const message = ErgoMessage.fromData("hello world");
    const proof = prover.signMessage(message, key);

    expect(prover.verify(message.encode(), hex.encode(proof), key)).to.be.true;
  });
});

describe("Message signing", () => {
  const encodedMainnet = "A4dg6hh8QVypCj6gu17ufkPE9Rq1dx6drurLQGnVNJBYb2FBTc";
  const encodedTestnet = "hAYVotCmDKbyL2PCAw7AoLmsyHKQuS7E63aEoH8PrQPSVHZ9gJ";

  it("Should sign a message from data", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // build the message
    const message = ErgoMessage.fromData("hello world");

    // sign
    const prover = new Prover();
    const signature = prover.signMessage(message, rootKey);

    // verify
    expect(prover.verify(message, signature, rootKey)).to.be.true;
  });

  it("Should sign a message from encoded hash", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // build the message
    const message = ErgoMessage.decode(encodedMainnet);

    // sign
    const prover = new Prover();
    const signature = prover.signMessage(message, rootKey);

    // verify
    expect(prover.verify(encodedMainnet, signature, rootKey)).to.be.true;
    expect(prover.verify(encodedTestnet, signature, rootKey)).to.be.false;
  });

  it("Should fail to verify a message when network is changed", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // build the message
    const mainnetMessage = ErgoMessage.decode(encodedMainnet);

    // sign
    const prover = new Prover();
    const signature = prover.signMessage(mainnetMessage, rootKey);

    // change the network
    mainnetMessage.setNetwork(Network.Testnet);

    // verify
    expect(prover.verify(mainnetMessage, signature, rootKey)).to.be.false;
  });

  it("Should throw when trying to sign without a secret key", async () => {
    const key = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const neuteredKey = key.wipePrivateData();

    // build the message
    const message = ErgoMessage.fromData("hello world");

    // sign
    const prover = new Prover();
    expect(() => prover.signMessage(message, neuteredKey as ErgoHDKey)).to.throw(
      "Private key is not present"
    );
  });
});
