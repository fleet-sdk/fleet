import { describe, expect, it } from "vitest";
import { bigIntToHex, hexToBigInt } from "./bigint";

describe("BigInt <> bytes serialization", () => {
  it("Should convert a bigint value to a hex string", () => {
    expect(bigIntToHex(-54417895017443177n)).toBe("ff3eab367a0f9097");

    expect(bigIntToHex(170892133397465074381480318756786823280n)).toBe(
      "008090a0b0c0d0e0f00010203040506070"
    );
    expect(bigIntToHex(-169390233523473389081894288674981388176n)).toBe(
      "8090a0b0c0d0e0f00010203040506070"
    );

    expect(bigIntToHex(1207883114728849269100423775319436127n)).toBe(
      "00e8a13c46cdde58d442c8e45b9f2b5f"
    );
    expect(bigIntToHex(-518499127179672366370132270668500813n)).toBe(
      "9c2404f2634ef40afccc320eed30b3"
    );
    expect(bigIntToHex(4n)).toBe("04");
  });

  it("Should convert a hex string to a bigint value", () => {
    expect(hexToBigInt("0e8a13c46cdde58d442c8e45b9f2b5f")).toBe(
      1207883114728849269100423775319436127n
    );
    expect(hexToBigInt("9c2404f2634ef40afccc320eed30b3")).toBe(
      -518499127179672366370132270668500813n
    );
  });
});
