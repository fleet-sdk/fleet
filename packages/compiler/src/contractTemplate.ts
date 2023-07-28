import { bytesToHex } from "@fleet-sdk/common";

export class ContractTemplate {
  private _bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  toBytes() {
    return this._bytes;
  }

  toHex() {
    return bytesToHex(this._bytes);
  }
}
