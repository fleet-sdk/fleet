import {
  ErgoMessage,
  Network,
  OutputBuilder,
  SGroupElement,
  SSigmaProp,
  TransactionBuilder
} from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import {
  BLOCKCHAIN_PARAMETERS,
  mockBlockchainStateContext,
  mockUTxO
} from "../../../mock-chain/src";
import { ErgoHDKey } from "../ergoHDKey";
import { generateMnemonic } from "../mnemonic";
import { Prover } from "./prover";
import { SigmaJsProver, type SigmaJsProverOptions } from "./sigmaJsProver";

const height = 1234209;
const externalAddress = "9gN8gmyaDBuWPZLn8zj9uZxnLUj4TE9rtedtLGNjf6cUhTmoTwc";

function createProver(overrides?: Partial<SigmaJsProverOptions>): SigmaJsProver {
  return new SigmaJsProver({
    context: mockBlockchainStateContext(),
    parameters: BLOCKCHAIN_PARAMETERS,
    ...overrides
  });
}
function buildTransaction(key: ErgoHDKey) {
  const input = mockUTxO({
    value: 1_000_000_000n,
    ergoTree: key.address.ergoTree
  });

  return new TransactionBuilder(height)
    .from(input)
    .to(new OutputBuilder(10_000_000n, externalAddress))
    .sendChangeTo(key.address)
    .payMinFee()
    .build();
}

describe("SigmaJsProver transaction signing", () => {
  it("signs an ErgoUnsignedTransaction", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const unsignedTx = buildTransaction(key);
    const signedTx = createProver().signTransaction(unsignedTx, [key]);
    const proof = hex.decode(signedTx.inputs[0].spendingProof?.proofBytes ?? "");

    expect(signedTx.inputs).toHaveLength(1);
    expect(signedTx.outputs).toHaveLength(unsignedTx.outputs.length);
    expect(new Prover().verify(unsignedTx, proof, key)).toBe(true);
  });

  it("signs an EIP-12 transaction with explicit options", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const unsignedTx = buildTransaction(key).toEIP12Object();
    const prover = createProver({ network: Network.Mainnet, baseCost: 0 });
    const signedTx = prover.signTransaction(unsignedTx, [key]);
    const proof = hex.decode(signedTx.inputs[0].spendingProof?.proofBytes ?? "");

    expect(prover.verify(unsignedTx, proof, key.publicKey)).toBe(true);
  });
  it("proves a script that reads a SigmaProp from a register", () => {
    const rootKey = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const signer = rootKey.deriveChild(1);
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: "190600e4c6a70408",
      additionalRegisters: {
        R4: SSigmaProp(SGroupElement(signer.publicKey)).toHex()
      }
    });
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .sendChangeTo(rootKey.address)
      .payMinFee()
      .build();

    const signedTx = createProver().signTransaction(unsignedTx, [signer]);
    expect(signedTx.inputs[0].spendingProof?.proofBytes).not.toBe("");
  });

  it("passes explicitly burned tokens to SigmaJS", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const tokenId = "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283";
    const input = mockUTxO({
      value: 1_000_000_000n,
      ergoTree: key.address.ergoTree,
      assets: [{ tokenId, amount: 10n }]
    });
    const unsignedTx = new TransactionBuilder(height)
      .from(input)
      .burnTokens({ tokenId, amount: 1n })
      .sendChangeTo(key.address)
      .payMinFee()
      .build();

    const signedTx = createProver().signTransaction(unsignedTx, [key]);
    expect(signedTx.inputs[0].spendingProof?.proofBytes).not.toBe("");
  });

  it("throws when a transaction key has no private data", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const unsignedTx = buildTransaction(key);
    const neutered = key.wipePrivateData() as ErgoHDKey;

    expect(() => createProver().signTransaction(unsignedTx, [neutered])).toThrow(
      "Private key is not present"
    );
  });
});

describe("SigmaJsProver message signing", () => {
  it("signs messages and interoperates with the existing verifier", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const message = ErgoMessage.fromData("hello sigma");
    const prover = createProver();
    const proof = prover.signMessage(message, key);

    expect(prover.verify(message, proof, key)).toBe(true);
    expect(new Prover().verify(message, proof, key)).toBe(true);
  });
  it("verifies byte, hex and Base58 message forms", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const message = ErgoMessage.fromData("message forms");
    const prover = createProver();
    const proof = prover.signMessage(message, key);
    const bytes = message.serialize().toBytes();

    expect(prover.verify(bytes, proof, key.publicKey)).toBe(true);
    expect(prover.verify(hex.encode(bytes), hex.encode(proof), key)).toBe(true);
    expect(prover.verify(message.encode(), proof, key)).toBe(true);
  });

  it("verifies unsigned and signed transaction message forms", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const unsignedTx = buildTransaction(key);
    const prover = createProver();
    const signedTx = prover.signTransaction(unsignedTx, [key]);
    const proof = hex.decode(signedTx.inputs[0].spendingProof?.proofBytes ?? "");

    expect(prover.verify(unsignedTx, proof, key)).toBe(true);
    expect(prover.verify(unsignedTx.toEIP12Object(), proof, key)).toBe(true);
    expect(prover.verify(signedTx, proof, key)).toBe(true);
  });

  it("returns false for invalid proofs and public keys", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const message = ErgoMessage.fromData("valid message");
    const prover = createProver();
    const proof = prover.signMessage(message, key);

    expect(prover.verify(ErgoMessage.fromData("different message"), proof, key)).toBe(false);
    expect(prover.verify(message, proof, new Uint8Array([1]))).toBe(false);
  });

  it("throws when a message key has no private data", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    const neutered = key.wipePrivateData() as ErgoHDKey;

    expect(() => createProver().signMessage(ErgoMessage.fromData("test"), neutered)).toThrow(
      "Private key is not present"
    );
  });
});
