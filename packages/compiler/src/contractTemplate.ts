import { hex } from "@fleet-sdk/crypto";

export class ContractTemplate {
  private _bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  toBytes() {
    return this._bytes;
  }

  toHex() {
    return hex.encode(this._bytes);
  }
}
