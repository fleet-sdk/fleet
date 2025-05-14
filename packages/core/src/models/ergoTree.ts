import {
  type Base58String,
  type HexString,
  Network,
  ergoTreeHeaderFlags
} from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { ErgoAddress } from "./ergoAddress";

const VERSION_MASK = 0x07;

export class ErgoTree {
  #bytes: Uint8Array;
  #network: Network;

  constructor(input: HexString | Uint8Array, network?: Network) {
    if (typeof input === "string") {
      this.#bytes = hex.decode(input);
    } else {
      this.#bytes = input;
    }

    this.#network = network ?? Network.Mainnet;
  }

  get header(): number {
    return this.#bytes[0];
  }

  get version(): number {
    return this.header & VERSION_MASK;
  }

  get hasSegregatedConstants(): boolean {
    return (this.header & ergoTreeHeaderFlags.constantSegregation) !== 0;
  }

  get hasSize(): boolean {
    return (this.header & ergoTreeHeaderFlags.sizeInclusion) !== 0;
  }

  toBytes(): Uint8Array {
    return this.#bytes;
  }

  toHex(): HexString {
    return hex.encode(this.toBytes());
  }

  toAddress(network?: Network): ErgoAddress {
    return ErgoAddress.fromErgoTree(this.toHex(), network ?? this.#network);
  }

  encode(network?: Network): Base58String {
    return this.toAddress(network).encode();
  }
}
