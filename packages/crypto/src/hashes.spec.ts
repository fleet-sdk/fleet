import { describe, expect, it } from "vitest";
import { hex, utf8 } from "./coders";
import { blake2b256, sha256 } from "./hashes";

describe("Hashes smoke tests", () => {
  it("Should hash message using BLAKE2b256", () => {
    expect(blake2b256(utf8.decode("blake2b256"))).to.be.deep.equal(
      hex.decode(
        "eb95e6932cedac15db722fcdb0cfd21437f94690339a716251fad2f89842ea8b"
      )
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
      hex.decode(
        "5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e"
      )
    );
  });
});
