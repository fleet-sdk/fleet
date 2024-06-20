import {
  type Base58String,
  type Box,
  type BoxCandidate,
  type EIP12UnsignedInput,
  type EIP12UnsignedTransaction,
  isHex,
  type NonMandatoryRegisters,
  type SignedTransaction,
  some
} from "@fleet-sdk/common";
import { ErgoMessage, ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { blake2b256, type ByteInput, ensureBytes, hex } from "@fleet-sdk/crypto";
import {
  type MinimalUnsignedTransaction,
  serializeBox,
  serializeTransaction
} from "@fleet-sdk/serializer";
import type { ErgoHDKey } from "../ergoHDKey";
import { sign, verify } from "./proveDLogProtocol";

type RKey = keyof NonMandatoryRegisters;
export type UnsignedTransaction =
  | EIP12UnsignedTransaction
  | ErgoUnsignedTransaction;
export type KeyMap = Record<number, ErgoHDKey> & { _?: ErgoHDKey[] };

export type Message =
  | SignedTransaction
  | ErgoUnsignedTransaction
  | MinimalUnsignedTransaction
  | ErgoMessage
  | ByteInput
  | Base58String;

export interface ISigmaProver {
  signTransaction(
    unsignedTx: UnsignedTransaction,
    keys: ErgoHDKey[]
  ): SignedTransaction;
  signMessage(message: ErgoMessage, key: ErgoHDKey): Uint8Array;
  verify(
    message: Message,
    proof: Uint8Array,
    publicKey: ErgoHDKey | Uint8Array
  ): boolean;
}

export class Prover implements ISigmaProver {
  signTransaction(
    message: UnsignedTransaction,
    keys: ErgoHDKey[] | KeyMap
  ): SignedTransaction {
    const getKeyFor = buildKeyMapper(keys);
    const txData = flattenTransactionObject(message);
    const txBytes = serializeTransaction(txData).toBytes();
    const txId = hex.encode(blake2b256(txBytes));

    return {
      id: txId,
      inputs: txData.inputs.map((input, index) => ({
        boxId: input.boxId,
        spendingProof: {
          extension: input.extension,
          proofBytes: hex.encode(
            generateProof(txBytes, getKeyFor(input, index))
          )
        }
      })),
      dataInputs: txData.dataInputs.map((x) => ({ boxId: x.boxId })),
      outputs: txData.outputs.map(mapOutput(txId))
    };
  }

  signMessage(message: ErgoMessage, key: ErgoHDKey): Uint8Array {
    return generateProof(message.serialize().toBytes(), key);
  }

  verify(
    message: Message,
    proof: ByteInput,
    publicKey: ErgoHDKey | Uint8Array
  ): boolean {
    let bytes: Uint8Array;

    if (typeof message === "string") {
      bytes = isHex(message)
        ? hex.decode(message)
        : ErgoMessage.decode(message).serialize().toBytes();
    } else if (message instanceof ErgoMessage) {
      bytes = message.serialize().toBytes();
    } else if (message instanceof Uint8Array) {
      bytes = message;
    } else if (message instanceof ErgoUnsignedTransaction) {
      bytes = message.toBytes();
    } else {
      bytes = serializeTransaction({
        ...message,
        inputs: message.inputs.map((input) => ({
          ...input,
          extension:
            "extension" in input
              ? input.extension
              : input.spendingProof.extension
        }))
      }).toBytes();
    }

    const pubKey =
      publicKey instanceof Uint8Array ? publicKey : publicKey.publicKey;
    return verify(bytes, ensureBytes(proof), pubKey);
  }
}

function buildKeyMapper(keys: ErgoHDKey[] | KeyMap) {
  const pskMap = new Map<string, ErgoHDKey>();

  // cache encoded public keys
  const keyMap = isKeyMap(keys) ? keys._ : keys;
  if (some(keyMap)) {
    for (const key of keyMap) pskMap.set(hex.encode(key.publicKey), key);
  }

  return (input: EIP12UnsignedInput, index: number): ErgoHDKey => {
    if (isKeyMap(keys)) {
      const secret = keys[index];
      if (secret) return secret;
    }

    if (pskMap.size === 1) return pskMap.values().next().value;

    for (const pk of pskMap.keys()) {
      // try to determine the secret key from the input by checking the ErgoTree and Registers
      if (includesPubKey(input, pk)) return pskMap.get(pk) as ErgoHDKey;
    }

    throw new Error(
      `Unable to find the corresponding secret for the input ${input.index}:${input.boxId}`
    );
  };
}

function isKeyMap(keys: ErgoHDKey[] | KeyMap): keys is KeyMap {
  return !Array.isArray(keys);
}

function includesPubKey(
  { ergoTree, additionalRegisters: registers }: EIP12UnsignedInput,
  pubKey: string
): boolean {
  return (
    ergoTree.includes(pubKey) ||
    (registers &&
      Object.keys(registers).some((k) =>
        registers[k as RKey]?.includes(pubKey)
      ))
  );
}

export function generateProof(message: Uint8Array, key: ErgoHDKey): Uint8Array {
  if (!key.privateKey) throw new Error("Private key is not present");
  return sign(message, key.privateKey);
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

function flattenTransactionObject(
  tx: UnsignedTransaction
): EIP12UnsignedTransaction {
  return tx instanceof ErgoUnsignedTransaction ? tx.toEIP12Object() : tx;
}
