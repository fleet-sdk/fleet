import {
  type EIP12UnsignedTransaction,
  Network,
  type SignedTransaction,
  type TokenAmount,
  isHex,
  utxoDiff,
  utxoSum
} from "@fleet-sdk/common";
import { ErgoMessage, ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { type ByteInput, bigintBE, ensureBytes, hex } from "@fleet-sdk/crypto";
import { serializeTransaction } from "@fleet-sdk/serializer";
import {
  ProverBuilder$,
  type ProverHints,
  ProverHints$,
  type ProverSecret,
  ProverSecret$,
  SigmaProp$,
  type SigmaPropProver,
  SigmaPropProver$,
  type SigmaPropVerifier,
  SigmaPropVerifier$
} from "sigmastate-js/main";
import type { ErgoHDKey } from "../ergoHDKey";
import type { ISigmaProver, Message, UnsignedTransaction } from "./prover";

type SigmaJsBlockchainParametersInternal = Parameters<typeof ProverBuilder$.create>[0];
type SigmaJsBuilder = ReturnType<typeof ProverBuilder$.create>;
type SigmaJsTransactionProver = ReturnType<SigmaJsBuilder["build"]>;
type SigmaJsBlockchainStateContextInternal = Parameters<SigmaJsTransactionProver["reduce"]>[0];

export type SigmaJsBlockchainParameters = {
  storageFeeFactor: number;
  minValuePerByte: number;
  maxBlockSize: number;
  tokenAccessCost: number;
  inputCost: number;
  dataInputCost: number;
  outputCost: number;
  maxBlockCost: number;
  softForkStartingHeight?: number;
  softForkVotesCollected?: number;
  blockVersion: number;
};

export type SigmaJsBlockchainStateContext = {
  sigmaLastHeaders: unknown[];
  previousStateDigest: string;
  sigmaPreHeader: unknown;
};

const proverHintsRuntime = ProverHints$ as unknown as { empty(): ProverHints };
const proverSecretRuntime = ProverSecret$ as unknown as { dlog(secret: bigint): ProverSecret };
const sigmaPropProverRuntime = SigmaPropProver$ as unknown as {
  withSecrets(secrets: ProverSecret[]): SigmaPropProver;
};
const sigmaPropVerifierRuntime = SigmaPropVerifier$ as unknown as {
  create(): SigmaPropVerifier;
};

export type SigmaJsProverOptions = {
  context: SigmaJsBlockchainStateContext;
  parameters: SigmaJsBlockchainParameters;
  network?: Network;
  baseCost?: number;
};
export class SigmaJsProver implements ISigmaProver {
  private readonly context: SigmaJsBlockchainStateContext;
  private readonly parameters: SigmaJsBlockchainParameters;
  private readonly network: Network;
  private readonly baseCost: number;

  constructor(options: SigmaJsProverOptions) {
    this.context = options.context;
    this.parameters = options.parameters;
    this.network = options.network ?? Network.Mainnet;
    this.baseCost = options.baseCost ?? 0;
  }

  signTransaction(unsignedTx: UnsignedTransaction, keys: ErgoHDKey[]): SignedTransaction {
    const tx = flattenTransactionObject(unsignedTx);
    const builder = ProverBuilder$.create(
      this.parameters as SigmaJsBlockchainParametersInternal,
      this.network
    );

    for (const key of keys) {
      if (!key.privateKey) throw new Error("Private key is not present");
      builder.withDLogSecret(bigintBE.encode(key.privateKey));
    }

    const prover = builder.build();
    const reducedTx = prover.reduce(
      this.context as SigmaJsBlockchainStateContextInternal,
      tx,
      tx.inputs,
      tx.dataInputs,
      getBurningTokens(tx),
      this.baseCost
    );
    return prover.signReduced(reducedTx, undefined) as SignedTransaction;
  }

  signMessage(message: ErgoMessage, key: ErgoHDKey): Uint8Array {
    if (!key.privateKey) throw new Error("Private key is not present");

    const secret = proverSecretRuntime.dlog(bigintBE.encode(key.privateKey));
    const proof = sigmaPropProverRuntime
      .withSecrets([secret])
      .signMessage(
        secret.publicKey(),
        toInt8Array(message.serialize().toBytes()),
        proverHintsRuntime.empty()
      );

    return Uint8Array.from(proof);
  }

  verify(message: Message, proof: ByteInput, publicKey: ErgoHDKey | Uint8Array): boolean {
    try {
      const publicKeyBytes = publicKey instanceof Uint8Array ? publicKey : publicKey.publicKey;
      const sigmaProp = SigmaProp$.fromPointHex(hex.encode(publicKeyBytes));

      return sigmaPropVerifierRuntime
        .create()
        .verifySignature(
          sigmaProp,
          toInt8Array(messageToBytes(message)),
          toInt8Array(ensureBytes(proof))
        );
    } catch {
      return false;
    }
  }
}

function toInt8Array(bytes: Uint8Array): Int8Array {
  return new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
function messageToBytes(message: Message): Uint8Array {
  if (typeof message === "string") {
    return isHex(message) ? hex.decode(message) : ErgoMessage.decode(message).serialize().toBytes();
  }

  if (message instanceof ErgoMessage) return message.serialize().toBytes();
  if (message instanceof Uint8Array) return message;
  if (message instanceof ErgoUnsignedTransaction) return message.toBytes();

  return serializeTransaction({
    ...message,
    inputs: message.inputs.map((input) => ({
      ...input,
      spendingProof: undefined,
      extension:
        "extension" in input
          ? input.extension
          : /* v8 ignore next */
            (input.spendingProof?.extension ?? {})
    }))
  }).toBytes();
}

function flattenTransactionObject(tx: UnsignedTransaction): EIP12UnsignedTransaction {
  return tx instanceof ErgoUnsignedTransaction ? tx.toEIP12Object() : tx;
}
function getBurningTokens(tx: EIP12UnsignedTransaction): TokenAmount<bigint>[] {
  const diff = utxoDiff(utxoSum(tx.inputs), utxoSum(tx.outputs));

  if (diff.tokens.length > 0) {
    diff.tokens = diff.tokens.filter((token) => token.tokenId !== tx.inputs[0].boxId);
  }

  return diff.tokens;
}
