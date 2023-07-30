import { hexToBytes, utf8ToBytes } from "@fleet-sdk/common";
import { describe, expect, it } from "vitest";
import { blake2b256, sha256, tests } from "./hashes";

describe("Hashes", () => {
  it("Should hash message using BLAKE2b256", () => {
    expect(blake2b256(utf8ToBytes("blake2b256"))).to.be.deep.equal(
      hexToBytes("eb95e6932cedac15db722fcdb0cfd21437f94690339a716251fad2f89842ea8b")
    );
  });

  it("Should hash message using sha256", () => {
    expect(sha256(utf8ToBytes("sha256"))).to.be.deep.equal(
      hexToBytes("5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e")
    );
  });
});
