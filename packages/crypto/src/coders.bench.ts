import { hexToBytes } from "@fleet-sdk/common";
import { hex } from "@scure/base";
import { bench, describe } from "vitest";

describe("HEX <> Bytes decoding", () => {
  const validHex = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7";
  // const invalidHex = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7tt";

  bench("Using scure", () => {
    hex.decode(validHex);
  });

  bench("Using own impl", () => {
    hexToBytes(validHex);
  });
});
