import { randomBytes } from "@noble/hashes/utils";
import { describe, expect, it } from "vitest";
import { hex, utf8 } from "./coders";
import { blake2b, blake2b256, sha256 } from "./hashes";

describe("Hashes smoke tests", () => {
  it("Should hash message using BLAKE2b256", () => {
    const msg = utf8.decode("blake2b256");
    expect(blake2b256(msg)).to.be.deep.equal(
      hex.decode("eb95e6932cedac15db722fcdb0cfd21437f94690339a716251fad2f89842ea8b")
    );
  });

  it("Should hash message using BLAKE2b with parameters", () => {
    const xpk = utf8.decode(
      "0488b21e000000000000000000b345a673afdeb85091c35d02083035f6e0ca284b1846223b23b566c4070a0cec02a3ad1969b60e85426791b75eccf038e6105c3afab8167af7eb6b73e709b81882"
    );

    expect(
      hex.encode(
        blake2b(xpk, {
          dkLen: 64,
          personalization: utf8.decode("wallets checksum")
        })
      )
    ).to.be.equal(
      "5d33031ea3bbba9d3332559b1dafd8612683092f535273a4c15ffa103ffa3fc11f7b6992f5a034b3c8dd30f6f103b24e500c44ba4cff2e5c7f6e3e2eb124cd32"
    );

    expect(
      hex.encode(
        blake2b(xpk, {
          dkLen: 64,
          personalization: hex.encode(utf8.decode("wallets checksum")),
          salt: hex.decode("d877f8df03fd687ab7c0052e3ce88372")
        })
      )
    ).to.be.equal(
      "f2afda2f44c2f5dd85d0e10e6d42b7c9220a1c8cfb0b25b8d7e554a0be570c39d8d299553fa8b2ecd56e4dc6eb240df93d67640558761df339c04638f2513d75"
    );

    expect(
      hex.encode(
        blake2b(xpk, {
          dkLen: 64,
          personalization: hex.encode(utf8.decode("wallets checksum")),
          key: "6a9059057f259d733766f6b32081b66c",
          salt: "d877f8df03fd687ab7c0052e3ce88372"
        })
      )
    ).to.be.equal(
      "48cc44fc205ce4932349ad81156b65477029392cb9fd4d6b05519a9a4c4f2485b9902a59ace75bc9215430f226f411ca90e02a34761980ee557ac2b55cc01282"
    );
  });

  it("Should handle strings as hex", () => {
    const msg = randomBytes(32);
    const key = randomBytes(32);
    const salt = randomBytes(16);
    const personalization = randomBytes(16);

    expect(blake2b(msg, { key, salt, personalization })).to.be.deep.equal(
      blake2b(msg, {
        key: hex.encode(key),
        salt: hex.encode(salt),
        personalization: hex.encode(personalization)
      })
    );
  });

  it("Should have the same result regardless input format", () => {
    const byte = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
    const hex = "deadbeef";

    expect(blake2b256(byte)).to.be.deep.equal(blake2b256(hex));
    expect(sha256(byte)).to.be.deep.equal(sha256(hex));
  });

  it("Should hash message using sha256", () => {
    expect(sha256(utf8.decode("sha256"))).to.be.deep.equal(
      hex.decode("5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e")
    );
  });
});
