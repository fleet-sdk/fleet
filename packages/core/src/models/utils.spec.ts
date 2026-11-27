import { AddressType, Network } from "@fleet-sdk/common";
import { base58, hex } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import {
  FEE_MAINNET_ADDRESS_TV,
  FEE_TESTNET_ADDRESS_TV
} from "../tests/testVectors/ergoAddressesTestVectors";
import { ErgoMessage } from "./ergoMessage";
import { encodeAddress, unpackAddress, validateAddress, validateUnpackedAddress } from "./utils";

describe("Address validation", () => {
  it("Should validate valid P2SH and P2S addresses", () => {
    const mainnetP2sh = encodeAddress(Network.Mainnet, AddressType.P2SH, new Uint8Array(24));
    const testnetP2sh = encodeAddress(Network.Testnet, AddressType.P2SH, new Uint8Array(24));

    expect(validateAddress(FEE_MAINNET_ADDRESS_TV)).to.be.true;
    expect(validateAddress(FEE_TESTNET_ADDRESS_TV)).to.be.true;
    expect(validateAddress(mainnetP2sh)).to.be.true;
    expect(validateAddress(testnetP2sh)).to.be.true;
  });

  it("Should not validate empty or non-Base58 strings", () => {
    expect(validateAddress("")).to.be.false;
    expect(validateAddress("0OIl")).to.be.false;
    expect(validateAddress("not a valid address!")).to.be.false;
    expect(validateAddress(" ")).to.be.false;
  });

  it("Should not validate too-short payloads", () => {
    expect(validateAddress("9eBy")).to.be.false;
    expect(validateAddress("11111")).to.be.false;
  });

  it("Should not validate encoded ErgoMessage or unknown address types", () => {
    const mainnetMessage = ErgoMessage.fromData("hello world").encode();
    const testnetMessage = ErgoMessage.fromData("hello world").encode(Network.Testnet);
    const type0 = encodeAddress(Network.Mainnet, 0 as AddressType, hex.decode("00"));
    const type5 = encodeAddress(Network.Mainnet, 5 as AddressType, hex.decode("00"));
    const type15 = encodeAddress(Network.Mainnet, 15 as AddressType, hex.decode("00"));

    expect(validateAddress(mainnetMessage)).to.be.false;
    expect(validateAddress(testnetMessage)).to.be.false;
    expect(validateAddress(type0)).to.be.false;
    expect(validateAddress(type5)).to.be.false;
    expect(validateAddress(type15)).to.be.false;
  });

  it("Should not validate addresses with invalid network bytes", () => {
    const invalidNet1 = encodeAddress(0x20 as Network, AddressType.P2S, hex.decode("00"));
    const invalidNet2 = encodeAddress(0xf0 as Network, AddressType.P2S, hex.decode("00"));

    expect(validateAddress(invalidNet1)).to.be.false;
    expect(validateAddress(invalidNet2)).to.be.false;
  });

  it("Should not validate P2SH addresses with invalid hash lengths", () => {
    for (const len of [19, 23, 25, 32]) {
      const addr = encodeAddress(Network.Mainnet, AddressType.P2SH, new Uint8Array(len));
      expect(validateAddress(addr)).to.be.false;
    }
  });

  it("Should not validate addresses with empty body", () => {
    const unpacked = unpackAddress(base58.decode(FEE_MAINNET_ADDRESS_TV));
    unpacked.body = new Uint8Array(0);
    expect(validateUnpackedAddress(unpacked)).to.be.false;
  });
});
