import { base58 } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import { ErgoMessage } from "./ergoMessage";
import { unpackAddress, validateAddress, validateUnpackedAddress } from "./utils";

describe("Address validation", () => {
  it("Should not validate addresses", () => {
    expect(validateAddress(ErgoMessage.fromData("hello world").encode())).to.be.true;
  });

  it("Should not validate addresses with empty body", () => {
    const unpacked = unpackAddress(
      base58.decode(ErgoMessage.fromData("hello world").encode())
    );
    unpacked.body = new Uint8Array(0);
    expect(validateUnpackedAddress(unpacked)).to.be.false;
  });
});
