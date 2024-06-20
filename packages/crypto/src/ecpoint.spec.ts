import { describe, expect, test } from "vitest";
import { hex } from "./coders/hex";
import { validateEcPoint } from "./ecpoint";

const testVectors = [
  {
    name: "valid compressed, positive Y coordinate",
    point: hex.decode(
      "0289b72d85b8a72b0a53960bafddadb74a149c6c1785d2bb46c244401e61d80b4d"
    ),
    valid: true
  },
  {
    name: "valid compressed, negative Y coordinate",
    point: hex.decode(
      "0376b32d0bb20f15004649946db5679adce657bef77c487add608115ce8050b16e"
    ),
    valid: true
  },
  {
    name: "invalid compressed",
    point: hex.decode(
      "0476b32d0bb20f15004649946db5679adce657bef77c487add608115ce8050b16e"
    ),
    valid: false
  },
  {
    name: "invalid compressed",
    point: hex.decode(
      "0576b32d0bb20f15004649946db5679adce657bef77c487add608115ce8050b16e"
    ),
    valid: false
  },
  {
    name: "valid uncompressed",
    point: hex.decode(
      "04784781bfad60e7da448912726c463736acdbc1864cec9ea3bfb22b3e974aa2bc579b466b40775367863186a7d9557be1b0f99ea55cff204019eba6539abead7b"
    ),
    valid: true
  },
  {
    name: "valid uncompressed",
    point: hex.decode(
      "04b4632d08485ff1df2db55b9dafd23347d1c47a457072a1e87be26896549a87378ec38ff91d43e8c2092ebda601780485263da089465619e0358a5c1be7ac91f4"
    ),
    valid: true
  },
  {
    name: "invalid uncompressed",
    point: hex.decode(
      "03b4632d08485ff1df2db55b9dafd23347d1c47a457072a1e87be26896549a87378ec38ff91d43e8c2092ebda601780485263da089465619e0358a5c1be7ac91f4"
    ),
    valid: false
  },
  {
    name: "length > 65",
    point: hex.decode(
      "04784781bfad60e7da448912726c463736acdbc1864cec9ea3bfb22b3e974aa2bc579b466b40775367863186a7d9557be1b0f99ea55cff204019eba6539abead7b9abead7b"
    ),
    valid: false
  },
  {
    name: "length > 33 and < 65",
    point: hex.decode(
      "0289b72d85b8a72b0a53960bafddadb74a149c6c1785d2bb46c244401e61d80b4d4e"
    ),
    valid: false
  },
  {
    name: "length < 33",
    point: hex.decode("020102030405060708"),
    valid: false
  },
  {
    name: "length < 33, valid positive head",
    point: hex.decode("02"),
    valid: false
  },
  {
    name: "length < 33, valid negative head",
    point: hex.decode("03"),
    valid: false
  },
  {
    name: "length < 33, valid negative head",
    point: hex.decode("04"),
    valid: false
  },
  { name: "empty", point: hex.decode(""), valid: false },
  {
    name: "undefined",
    point: undefined as unknown as Uint8Array,
    valid: false
  }
];

describe("Compressed ECPoint validation", () => {
  test.each(testVectors)("Should validate compressed ECPoint: $name", (tv) => {
    expect(validateEcPoint(tv.point)).to.be.equal(tv.valid);
  });
});
