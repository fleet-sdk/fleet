import { describe, expect, it, test } from "vitest";
import { utf8 } from "./utf8";

describe("UTF-8 <> bytes serialization", () => {
  /**
   * @description For testing UTF-8 coder
   * @expected it should encode and decode correctly
   */
  it("Should roundtrip", () => {
    expect(utf8.encode(utf8.decode("this is a regular string"))).to.be.equal(
      "this is a regular string"
    );
  });

  /**
   * @description For testing UTF-8 coder
   * @expected it should encode and decode correctly
   */
  test("utf8 to bytes with invalid inputs", () => {
    const notAString = true as unknown as string;
    expect(() => utf8.decode(notAString)).to.throw(
      "Expected an object of type 'string', got 'boolean'."
    );
  });

  /**
   * @description For testing UTF-8 coder
   * @expected it should encode and decode correctly
   */
  test("bytes to utf8 with invalid inputs", () => {
    const invalidBytes = {} as unknown as Uint8Array;
    expect(() => utf8.encode(invalidBytes)).to.throw(
      "Expected an instance of 'Uint8Array', got 'Object'."
    );
  });
});
