import { hex, randomBytes } from "@fleet-sdk/crypto";
import { secp256k1 } from "@noble/curves/secp256k1";
import { Address, verify_signature } from "ergo-lib-wasm-nodejs";
import { describe, expect, it } from "vitest";
import { sign, verify } from "./proveDLogProtocol";

const { getPublicKey } = secp256k1;
const testVectors = [
  {
    msg: "1dc01772ee0171f5f614c673e3c7fa1107a8cf727bdf5a6dadb379e93c0d1d00",
    sk: "f4aa4c487af71fb8b52a3ecd0d398393c2d247d6f0a25275e5d986854b3e2db8",
    signature: "11",
    isValid: false
  },
  {
    msg: "1dc01772ee0171f5f614c673e3c7fa1107a8cf727bdf5a6dadb379e93c0d1d00",
    sk: "f4aa4c487af71fb8b52a3ecd0d398393c2d247d6f0a25275e5d986854b3e2db8",
    signature:
      "3506a7213dc1be4ad822a9cbab2f4a188778cfb3b2b4cfea76a4fe71760715fed7e2de9c13f492c7981663b03986f454d494da39a269c70c",
    isValid: true
  },
  {
    msg: "1dc01772ee0171f5f614c673e3c7fa1107a8cf727bdf5a6dadb379e93c0d1d00",
    sk: "f4aa4c487af71fb8b52a3ecd0d398393c2d247d6f0a25275e5d986854b3e2db8",
    signature:
      "3506a7213dc1be4ad822a9cbab2f4a188778cfb3b2b4cfea76a4fe71760715fed7e2de9c13f492c7981663b03986f454d494da39a269c70a",
    isValid: false
  },
  {
    msg: "dc1be4ad822a9cbab2f4a188778cfb3b2b4cfe",
    sk: "f4aa4c487af71fb8b52a3ecd0d398393c2d247d6f0a25275e5d986854b3e2db8",
    signature:
      "3506a7213dc1be4ad822a9cbab2f4a188778cfb3b2b4cfea76a4fe71760715fed7e2de9c13f492c7981663b03986f454d494da39a269c70c",
    isValid: false
  },
  {
    msg: "dc1be4ad822a9cbab2f4a188778cfb3b2b4cfe",
    sk: "aaaaaaaaaaf71fb8b52a3ecd0d398393c2d247d6f0a25275e5d986854b3aaaaa",
    signature:
      "a8270c3a0368f422a54361c698efdea8c41cbb044b2f65da1820f2131824752062547577af8ff1465a8542f13ca009f1dcefc885cba33686",
    isValid: true
  }
];

describe("Ergo Schnorr signature schema", () => {
  it("Should test vectors", () => {
    testVectors.forEach((tv) => {
      const message = hex.decode(tv.msg);
      const signature = hex.decode(tv.signature);
      const publicKey = getPublicKey(hex.decode(tv.sk));

      expect(verify(message, signature, publicKey)).toBe(tv.isValid);
    });
  });

  it("Should generate valid signature", () => {
    for (let i = 0; i < 100; i++) {
      const message = randomBytes(32);
      const secretKey = randomBytes(32);
      const publicKey = getPublicKey(hex.encode(secretKey));
      const signature = sign(message, secretKey);

      expect(verify(message, signature, publicKey)).toBe(true);

      // verify using sigma-rust
      expect(verify_signature(Address.from_public_key(publicKey), message, signature)).toBe(true);
    }
  });
});
