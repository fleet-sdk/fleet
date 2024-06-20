import { hex, randomBytes } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import {
  SBigInt,
  SBool,
  SByte,
  SColl,
  SConstant,
  SGroupElement,
  SInt,
  SLong,
  SParse,
  SShort,
  SSigmaProp,
  SUnit
} from "./constantSerializer";

describe("Serialize -> Parse roundtrip", () => {
  function randomInt(min: number, max: number) {
    const mn = Math.ceil(min);
    const mx = Math.floor(max);

    return Math.floor(Math.random() * (mx - mn + 1)) + mn;
  }

  function getRandomBigInt(bytes: number) {
    return BigInt(`0x${hex.encode(randomBytes(bytes))}`);
  }

  function randomBigInt(min: bigint, max: bigint) {
    // increase the chances of negative numbers generation;
    const rand =
      getRandomBigInt(1) % 2n === 0n
        ? getRandomBigInt(1)
        : getRandomBigInt(1) * -1n;

    return (rand * (max - min + 1n) + min) / 10_000n;
  }

  it("Should roundtrip SColl", () => {
    const intVal = [1, 2, 3];
    expect(SParse(SConstant(SColl(SInt, intVal)))).toEqual(intVal);

    const hexVal = "deadbeef";
    expect(SParse(SConstant(SColl(SByte, hexVal)))).to.be.deep.equal(
      hex.decode(hexVal)
    );

    const bytes = hex.decode(hexVal);
    expect(SParse(SConstant(SColl(SByte, bytes)))).to.be.deep.equal(bytes);
  });

  it("Should serialize SUnit", () => {
    expect(SConstant(SUnit())).toBe("62");
  });

  it("Should roundtrip SBoolean", () => {
    expect(SParse(SConstant(SBool(true)))).toBe(true);
    expect(SParse(SConstant(SBool(false)))).toBe(false);
  });

  it("Should roundtrip SByte", () => {
    const value = randomInt(0, 127);
    expect(SParse(SConstant(SByte(value)))).toBe(value);
  });

  it("Should roundtrip SShort", () => {
    const value = randomInt(-32_768, 32_767);
    expect(SParse(SConstant(SShort(value)))).toBe(value);
  });

  it("Should roundtrip SInt", () => {
    // https://docs.scala-lang.org/overviews/scala-book/built-in-types.html

    const value = randomInt(-2_147_483_648, 2_147_483_647);
    expect(SParse(SConstant(SInt(value)))).toBe(value);
  });

  it("Should roundtrip SLong", () => {
    const value = randomBigInt(
      -9_223_372_036_854_775_808n,
      9_223_372_036_854_775_807n
    );
    expect(SParse(SConstant(SLong(value)))).toBe(value);
  });

  it("Should roundtrip SBigInt", () => {
    const value = randomBigInt(
      -9_223_372_036_854_775_808_000n,
      9_223_372_036_854_775_807_000n
    );
    expect(SParse(SConstant(SBigInt(value)))).toBe(value);
  });

  it("Should roundtrip SGroupElement", () => {
    const value = hex.decode(
      "02000031a06023f7d372f748a816db1765b4e4f1989cf89791c021a37ce09dae37"
    );
    expect(SParse(SConstant(SGroupElement(value)))).toEqual(value);
  });

  it("Should roundtrip SSigmaProp", () => {
    const value = hex.decode(
      "0200c662d546939237a0195ef8be81fb0f939285c374b3589cc5d7172c98e33b22"
    );
    expect(SParse(SConstant(SSigmaProp(SGroupElement(value))))).toEqual(value);
  });
});
