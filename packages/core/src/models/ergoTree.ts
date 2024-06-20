import {
  ergoTreeHeaderFlags,
  type HexString,
  Network
} from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { ErgoAddress } from "./ergoAddress";

const VERSION_MASK = 0x07;

export class ErgoTree {
  private _bytes: Uint8Array;

  constructor(input: HexString | Uint8Array) {
    if (typeof input === "string") {
      this._bytes = hex.decode(input);
    } else {
      this._bytes = input;
    }
  }

  get header(): number {
    return this._bytes[0];
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
    return this._bytes;
  }

  toHex(): HexString {
    return hex.encode(this.toBytes());
  }

  toAddress(network = Network.Mainnet): ErgoAddress {
    return ErgoAddress.fromErgoTree(this.toHex(), network);
  }
}
