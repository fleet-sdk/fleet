import { describe, expect, it, test } from "vitest";
import { hex } from "./hex";

const ui8 = (bytes: number[]) => Uint8Array.from(bytes);

const bytesTestVector = {
  lowerCaseHex: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff" /* prettier-ignore */,
  upperCaseHex: "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C2D2E2F303132333435363738393A3B3C3D3E3F404142434445464748494A4B4C4D4E4F505152535455565758595A5B5C5D5E5F606162636465666768696A6B6C6D6E6F707172737475767778797A7B7C7D7E7F808182838485868788898A8B8C8D8E8F909192939495969798999A9B9C9D9E9FA0A1A2A3A4A5A6A7A8A9AAABACADAEAFB0B1B2B3B4B5B6B7B8B9BABBBCBDBEBFC0C1C2C3C4C5C6C7C8C9CACBCCCDCECFD0D1D2D3D4D5D6D7D8D9DADBDCDDDEDFE0E1E2E3E4E5E6E7E8E9EAEBECEDEEEFF0F1F2F3F4F5F6F7F8F9FAFBFCFDFEFF" /* prettier-ignore */,
  mixedCaseHex: "000102030405060708090a0B0c0D0e0F101112131415161718191a1B1c1D1e1F202122232425262728292a2B2c2D2e2F303132333435363738393a3B3c3D3e3F404142434445464748494a4B4c4D4e4F505152535455565758595a5B5c5D5e5F606162636465666768696a6B6c6D6e6F707172737475767778797a7B7c7D7e7F808182838485868788898a8B8c8D8e8F909192939495969798999a9B9c9D9e9Fa0A1a2A3a4A5a6A7a8A9aaABacADaeAFb0B1b2B3b4B5b6B7b8B9baBBbcBDbeBFc0C1c2C3c4C5c6C7c8C9caCBccCDceCFd0D1d2D3d4D5d6D7d8D9daDBdcDDdeDFe0E1e2E3e4E5e6E7e8E9eaEBecEDeeEFf0F1f2F3f4F5f6F7f8F9faFBfcFDfeFF" /* prettier-ignore */,
  bytes: ui8([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255]) /* prettier-ignore */
};

describe("Hex <> Bytes serialization", () => {
  it("Should convert hex to bytes", () => {
    expect(hex.decode("deadbeef")).to.be.deep.equal(ui8([0xde, 0xad, 0xbe, 0xef]));
    expect(hex.decode("DEADBEEF")).to.be.deep.equal(ui8([0xde, 0xad, 0xbe, 0xef]));
    expect(hex.decode("cafe123456")).to.be.deep.equal(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]));
    expect(hex.decode("CAFE123456")).to.be.deep.equal(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]));

    const { lowerCaseHex, upperCaseHex, mixedCaseHex, bytes } = bytesTestVector;
    expect(hex.decode(lowerCaseHex)).to.be.deep.equal(bytes);
    expect(hex.decode(upperCaseHex)).to.be.deep.equal(bytes);
    expect(hex.decode(mixedCaseHex)).to.be.deep.equal(bytes);
  });

  it("Should convert bytes to hex", () => {
    expect(hex.encode(ui8([0xde, 0xad, 0xbe, 0xef]))).to.be.equal("deadbeef");
    expect(hex.encode(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]))).to.be.equal("cafe123456");
  });

  it("Should roundtrip", () => {
    expect(hex.encode(hex.decode("deadbeef"))).to.be.deep.equal("deadbeef");
    expect(hex.decode(hex.encode(ui8([0xca, 0xfe, 0x12, 0x34, 0x56])))).to.be.deep.equal(
      ui8([0xca, 0xfe, 0x12, 0x34, 0x56])
    );
  });

  test("Hex to byte with invalid inputs", () => {
    expect(() => hex.decode("non hex string")).to.throw("Invalid byte sequence");
    expect(() => hex.decode("0643d437ee7")).to.throw("Invalid hex padding");
    expect(() => hex.decode(1 as unknown as string)).to.throw(
      "Expected an object of type 'string', got 'number'."
    );
  });

  test("Bytes to hex with invalid inputs", () => {
    const invalidBytes = [1, -2, 2, -55] as unknown as Uint8Array;
    expect(() => hex.encode(invalidBytes)).to.throw(
      "Expected an instance of 'Uint8Array', got 'Array'."
    );
  });
});
