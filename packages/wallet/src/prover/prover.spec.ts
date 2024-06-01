import { OutputBuilder, SGroupElement, SSigmaProp, TransactionBuilder } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { Address, verify_signature } from "ergo-lib-wasm-nodejs";
import { describe, expect, it } from "vitest";
import { mockUTxO } from "../../../mock-chain/src"; // let's avoid circular dependencies
import { ErgoHDKey } from "../ergoHDKey";
import { generateMnemonic } from "../mnemonic";
import { Prover } from "./prover";

describe("Transaction signing", () => {
  const height = 1234209;
  const externalAddress = "9gN8gmyaDBuWPZLn8zj9uZxnLUj4TE9rtedtLGNjf6cUhTmoTwc";

  it("Should sign a transaction with a single secret and a single input", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());

    // mock inputs
    const input = mockUTxO({ value: 1_000_000_000n, ergoTree: rootKey.address.ergoTree });

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
    const txBytes = unsignedTx.toBytes();
    const proof = hex.decode(signedTx.inputs[0].spendingProof.proofBytes);

    // verify using own verifier
    expect(prover.verify(txBytes, proof, rootKey)).to.be.true;

    // verify using sigma-rust for comparison
    const addr = Address.from_public_key(rootKey.publicKey);
    expect(verify_signature(addr, txBytes, proof)).to.be.true;
  });

  it("Should should determine key from registers", async () => {
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
    const txBytes = unsignedTx.toBytes();
    const proof = hex.decode(signedTx.inputs[0].spendingProof.proofBytes);

    // verify using own verifier
    expect(prover.verify(txBytes, proof, child1)).to.be.true;

    // verify using sigma-rust for comparison
    const addr = Address.from_public_key(child1.publicKey);
    expect(verify_signature(addr, txBytes, proof)).to.be.true;
  });

  it("Should select corresponding key and sign a transaction with multiple secrets and a single input", async () => {
    // generate keys
    const rootKey = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const child1 = rootKey.deriveChild(1);
    const child2 = rootKey.deriveChild(2);

    // mock inputs
    const input = mockUTxO({ value: 1_000_000_000n, ergoTree: rootKey.address.ergoTree });

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
    const txBytes = unsignedTx.toBytes();
    const proof = hex.decode(signedTx.inputs[0].spendingProof.proofBytes);

    // verify using own verifier
    expect(prover.verify(txBytes, proof, rootKey)).to.be.true;

    // verify using sigma-rust for comparison
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
    const proof0 = hex.decode(signedTx.inputs[0].spendingProof.proofBytes);
    const proof1 = hex.decode(signedTx.inputs[1].spendingProof.proofBytes);

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
    const proof0 = hex.decode(signedTx.inputs[0].spendingProof.proofBytes);
    const proof1 = hex.decode(signedTx.inputs[1].spendingProof.proofBytes);
    const proof2 = hex.decode(signedTx.inputs[2].spendingProof.proofBytes);

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
    const proof0 = hex.decode(signedTx.inputs[0].spendingProof.proofBytes);
    const proof1 = hex.decode(signedTx.inputs[1].spendingProof.proofBytes);

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
    const input = mockUTxO({ value: 1_000_000_000n, ergoTree: rootKey.address.ergoTree });

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
      mockUTxO({ value: 1_000_000_000n * BigInt(index + 1), ergoTree: rootKey.address.ergoTree })
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
    signedTx.inputs.forEach((input) => {
      const proof = hex.decode(input.spendingProof.proofBytes);
      expect(prover.verify(txBytes, proof, rootKey)).to.be.true;
    });

    // verify all inputs using sigma-rust for comparison
    const addr = Address.from_public_key(rootKey.publicKey);
    signedTx.inputs.forEach((input) => {
      const proof = hex.decode(input.spendingProof.proofBytes);
      expect(verify_signature(addr, txBytes, proof)).to.be.true;
    });
  });

  it("Should throw when trying to sign without a secret key", async () => {
    const key = await ErgoHDKey.fromMnemonic(generateMnemonic());
    const neuteredKey = key.wipePrivateData();

    // mock inputs
    const input = mockUTxO({ value: 1_000_000_000n, ergoTree: neuteredKey.address.ergoTree });

    // build the unsigned transaction
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .to(new OutputBuilder(10_000_000n, externalAddress))
      .sendChangeTo(neuteredKey.address)
      .payMinFee()
      .build();

    // sign
    const prover = new Prover();
    expect(() => prover.signTransaction(unsignedTx.toEIP12Object(), [neuteredKey])).to.throw(
      "Private key is not present"
    );
  });
});
