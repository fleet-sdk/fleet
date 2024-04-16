import { hex } from "@fleet-sdk/crypto";
import { secp256k1 } from "@noble/curves/secp256k1";
import { Address, verify_signature } from "ergo-lib-wasm-nodejs";
import fc from "fast-check";
import { describe, expect, it, test } from "vitest";
import { sign, umod, verify } from "./proveDLogProtocol";

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

describe("Unsigned modulo", () => {
  it("Should calculate unsigned modulo", () => {
    expect(umod(1n, 2n)).to.be.equal(1n);
    expect(umod(121n, 23n)).to.be.equal(6n);
    expect(umod(121n, -23n)).to.be.equal(6n);
    expect(umod(-121n, 23n)).to.be.equal(17n);
  });
});

describe("ProveDLog protocol", () => {
  test.each(testVectors)("Should test vectors", (tv) => {
    const message = hex.decode(tv.msg);
    const signature = hex.decode(tv.signature);
    const publicKey = getPublicKey(hex.decode(tv.sk));

    expect(verify(message, signature, publicKey)).to.be.equal(tv.isValid);
  });

  it("Should throw if trying to verify with an invalid public key", () => {
    const msg = hex.decode("deadbeef");
    const proof = hex.decode(
      "3506a7213dc1be4ad822a9cbab2f4a188778cfb3b2b4cfea76a4fe71760715fed7e2de9c13f492c7981663b03986f454d494da39a269c70c"
    );
    const pk = hex.decode("01010ba8a2cba190547dd5569f2421d2f60426637c40bd325d1bea0f1b3e8d83be");

    expect(() => verify(msg, proof, pk)).to.throw("Invalid Public Key.");
  });

  it("Should sign and verify random messages", () => {
    fc.assert(
      fc.property(
        fc.record({
          msg: fc.uint8Array({ size: "large" }),
          sk: fc.uint8Array({ minLength: 32, maxLength: 32 })
        }),
        ({ msg, sk }) => {
          const pk = getPublicKey(hex.encode(sk));
          const signature = sign(msg, sk);

          expect(verify(msg, signature, pk)).to.be.true;
          expect(verify_signature(Address.from_public_key(pk), msg, signature)).to.be.true;
        }
      )
    );
  });
});
