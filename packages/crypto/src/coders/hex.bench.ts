import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { hex as scureHex } from "@scure/base";
import { bench, describe } from "vitest";
import { regularBoxes, validBoxes } from "../../../_test-vectors/mockedBoxes";
import { hex as fleetHex } from "./hex";

const hexString = [...regularBoxes, ...validBoxes].map((x) => x.ergoTree + x.ergoTree).join("");
const bytes = hexToBytes(hexString);

describe("Decode hex to bytes", () => {
  bench("@noble/hashes implementation", () => {
    hexToBytes(hexString);
  });

  bench("@scure/base implementation", () => {
    scureHex.decode(hexString);
  });

  bench("@fleet-sdk/crypto implementation", () => {
    fleetHex.decode(hexString);
  });
});

describe("Encode bytes to hex", () => {
  bench("@noble/hashes implementation", () => {
    bytesToHex(bytes);
  });

  bench("@scure/base implementation", () => {
    scureHex.encode(bytes);
  });

  bench("@fleet-sdk/crypto implementation", () => {
    fleetHex.encode(bytes);
  });
});
