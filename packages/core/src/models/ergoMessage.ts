import { AddressType, Base58String, Network } from "@fleet-sdk/common";
import { base58, blake2b256, BytesInput, hex } from "@fleet-sdk/crypto";
import { concatBytes } from "packages/common/src";
import { CHECKSUM_LENGTH, getAddressType, getNetworkType } from "./utils";

function ensureBytes(input: BytesInput): Uint8Array {
  return typeof input === "string" ? hex.decode(input) : input;
}

export class ErgoMessage {
  #message?: Uint8Array;
  #hash?: Uint8Array;
  #network: Network;

  constructor(message?: BytesInput, network = Network.Mainnet) {
    this.#message = ensureBytes(message ?? Uint8Array.from([]));
    this.#network = network;
  }

  get hash(): Uint8Array {
    if (this.#hash) return this.#hash;
    else if (this.#message) return (this.#hash = blake2b256(this.#message));
    else throw new Error("Neither message nor hash is provided");
  }

  encode(): string {
    const head = Uint8Array.from([this.#network + AddressType.ADH]);
    const body = concatBytes(head, this.hash);
    const checksum = blake2b256(body).subarray(0, CHECKSUM_LENGTH);
    return base58.encode(concatBytes(body, checksum));
  }

  decode(encodedHash: Base58String): ErgoMessage {
    const bytes = base58.decode(encodedHash);
    const type = getAddressType(bytes);
    if (type !== AddressType.ADH) throw new Error("Invalid message type");

    const network = getNetworkType(bytes);
    const hash = bytes.subarray(1, bytes.length - CHECKSUM_LENGTH);
    return new ErgoMessage(hash, network);
  }

  // fromBase58Hash(hash: string): ErgoMessage {
  //   const bytes = ensureBytes(hash);
  //   return new ErgoMessage(hex.encode(bytes));
  // }
}
