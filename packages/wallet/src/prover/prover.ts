import type {
  Box,
  BoxCandidate,
  EIP12UnsignedInput,
  EIP12UnsignedTransaction,
  HexString,
  SignedTransaction
} from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeBox, serializeTransaction } from "@fleet-sdk/serializer";
import { ErgoHDKey } from "../ergoHDKey";
import { sign, verify } from "./proveDLogProtocol";

type UnsignedTransaction = EIP12UnsignedTransaction | ErgoUnsignedTransaction;
type KeyMapper = (input: EIP12UnsignedInput) => ErgoHDKey | undefined;

export interface ISigmaProver {
  signTransaction(
    unsignedTx: UnsignedTransaction,
    keys: ErgoHDKey[],
    keyMapper?: KeyMapper
  ): SignedTransaction;

  verify(message: Uint8Array, signature: Uint8Array, key: ErgoHDKey): boolean;
}

export class Prover implements ISigmaProver {
  signTransaction(
    unsignedTx: UnsignedTransaction,
    keys: ErgoHDKey[],
    keyMapper?: KeyMapper
  ): SignedTransaction {
    const getKeyFor = buildKeyMapper(keys, keyMapper);
    const txData =
      unsignedTx instanceof ErgoUnsignedTransaction ? unsignedTx.toEIP12Object() : unsignedTx;
    const txBytes = serializeTransaction(txData).toBytes();
    const txId = hex.encode(blake2b256(txBytes));

    return {
      id: txId,
      inputs: txData.inputs.map((input) => ({
        boxId: input.boxId,
        spendingProof: {
          extension: input.extension,
          proofBytes: generateProof(txBytes, getKeyFor(input))
        }
      })),
      dataInputs: txData.dataInputs.map((x) => ({ boxId: x.boxId })),
      outputs: txData.outputs.map(mapOutput(txId))
    };
  }

  verify(message: Uint8Array, signature: Uint8Array, pubKey: ErgoHDKey): boolean {
    return verify(message, signature, pubKey.publicKey);
  }
}

function buildKeyMapper(keys: ErgoHDKey[], mapper?: KeyMapper) {
  const pskMap = new Map<string, ErgoHDKey>();

  return (input: EIP12UnsignedInput): ErgoHDKey => {
    if (keys.length === 1) return keys[0];

    if (mapper) {
      const secret = mapper(input);
      if (secret) return secret;
    }

    // lazily cache encoded public keys
    if (pskMap.size === 0) {
      keys.forEach((secret) => pskMap.set(hex.encode(secret.publicKey), secret));
    }

    for (const pk of pskMap.keys()) {
      // dumbly check if the public key is included in the the ErgoTree and Registers,
      // if so, return the corresponding secret
      if (includesPubKey(input, pk)) return pskMap.get(pk) as ErgoHDKey;
    }

    throw new Error(
      `Unable to find the corresponding secret for the input ${input.index}:${input.boxId}`
    );
  };
}

function includesPubKey(input: EIP12UnsignedInput, pubKey: string): boolean {
  return (
    input.ergoTree.includes(pubKey) ||
    (!!input.additionalRegisters?.R4 && input.additionalRegisters.R4.includes(pubKey)) ||
    (!!input.additionalRegisters?.R5 && input.additionalRegisters.R5.includes(pubKey)) ||
    (!!input.additionalRegisters?.R6 && input.additionalRegisters.R6.includes(pubKey)) ||
    (!!input.additionalRegisters?.R7 && input.additionalRegisters.R7.includes(pubKey)) ||
    (!!input.additionalRegisters?.R8 && input.additionalRegisters.R8.includes(pubKey)) ||
    (!!input.additionalRegisters?.R9 && input.additionalRegisters.R9.includes(pubKey))
  );
}

export function generateProof(txBytes: Uint8Array, key: ErgoHDKey): HexString {
  if (!key.privateKey) throw new Error("Private key is not present");
  return hex.encode(sign(txBytes, key.privateKey));
}

function mapOutput(txId: string) {
  return (x: BoxCandidate<string>, i: number) => {
    const box: Box<string> = {
      boxId: "",
      ...x,
      transactionId: txId,
      index: i
    };
    box.boxId = hex.encode(blake2b256(serializeBox(box).toBytes()));

    return box;
  };
}
