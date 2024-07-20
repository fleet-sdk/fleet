import { describe, expect, test } from "vitest";
import { base58, base58check, base64, utf8 } from ".";

describe("Coders smoke tests", () => {
  test("base64 coder roundtrip", () => {
    const decodedBase64 = utf8.decode("this is a base64 encoded string");
    const encodedBase64 = "dGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIHN0cmluZw==";

    expect(base64.encode(decodedBase64)).to.be.equal(encodedBase64);
    expect(base64.decode(encodedBase64)).to.be.deep.equal(decodedBase64);
  });

  test("base58 coder roundtrip", () => {
    const decodedBase58 = utf8.decode("this is a base58 encoded string");
    const encodedBase58 = "2mxCXDZDHgWsZCCCUBhmanjEeEFPM5dg8FVb659iiJa";

    expect(base58.encode(decodedBase58)).to.be.equal(encodedBase58);
    expect(base58.decode(encodedBase58)).to.be.deep.equal(decodedBase58);
  });

  test("base58check coder roundtrip", () => {
    const decodedBase58check = utf8.decode("this is a base58check encoded string");
    const encodedBase58check = "6nURSRrD1s933Ruwq4Gi9XzULMhuRQbX1mYrnY2jknX9pW67uKbADDk";

    expect(base58check.encode(decodedBase58check)).to.be.equal(encodedBase58check);
    expect(base58check.decode(encodedBase58check)).to.be.deep.equal(decodedBase58check);
  });
});
