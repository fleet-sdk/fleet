import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { mockUTxO } from "@fleet-sdk/mock-chain";
import { Address, verify_signature } from "ergo-lib-wasm-nodejs";
import { describe, expect, it } from "vitest";
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
});
