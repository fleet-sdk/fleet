import { hex as scureHex } from "@scure/base";
import { bench, describe } from "vitest";
import { hex as fleetHex } from "./hex";

describe("HEX <> Bytes decoding", () => {
  const validHex = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7";

  bench("@scure implementation", () => {
    scureHex.encode(scureHex.decode(validHex));
  });

  bench("Fleet implementation", () => {
    fleetHex.encode(fleetHex.decode(validHex));
  });
});
