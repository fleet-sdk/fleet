import {
  Box,
  BoxCandidate,
  EIP12UnsignedInput,
  EIP12UnsignedTransaction,
  HexString,
  NonMandatoryRegisters,
  SignedTransaction,
  some
} from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeBox, serializeTransaction } from "@fleet-sdk/serializer";
import { ErgoHDKey } from "../ergoHDKey";
import { sign, verify } from "./proveDLogProtocol";

type RKey = keyof NonMandatoryRegisters;
export type UnsignedTransaction = EIP12UnsignedTransaction | ErgoUnsignedTransaction;
export type KeyMap = Record<number, ErgoHDKey> & { _?: ErgoHDKey[] };

export interface ISigmaProver {
  signTransaction(unsignedTx: UnsignedTransaction, keys: ErgoHDKey[]): SignedTransaction;
  verify(message: Uint8Array, signature: Uint8Array, key: ErgoHDKey): boolean;
}

export class Prover implements ISigmaProver {
  signTransaction(unsignedTx: UnsignedTransaction, keys: ErgoHDKey[] | KeyMap): SignedTransaction {
    const getKeyFor = buildKeyMapper(keys);
    const txData =
      unsignedTx instanceof ErgoUnsignedTransaction ? unsignedTx.toEIP12Object() : unsignedTx;
    const txBytes = serializeTransaction(txData).toBytes();
    const txId = hex.encode(blake2b256(txBytes));

    return {
      id: txId,
      inputs: txData.inputs.map((input, index) => ({
        boxId: input.boxId,
        spendingProof: {
          extension: input.extension,
          proofBytes: generateProof(txBytes, getKeyFor(input, index))
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

function buildKeyMapper(keys: ErgoHDKey[] | KeyMap) {
  const pskMap = new Map<string, ErgoHDKey>();

  // cache encoded public keys
  const k = isKeyMap(keys) ? keys._ : keys;
  if (some(k)) k.forEach((key) => pskMap.set(hex.encode(key.publicKey), key));

  return (input: EIP12UnsignedInput, index: number): ErgoHDKey => {
    if (isKeyMap(keys)) {
      const secret = keys[index];
      if (secret) return secret;
    }

    if (pskMap.size === 1) {
      return pskMap.values().next().value;
    }

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
    (registers && Object.keys(registers).some((k) => registers[k as RKey]?.includes(pubKey)))
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
