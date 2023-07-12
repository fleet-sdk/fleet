import { Network } from "@fleet-sdk/common";
import { SInt } from "@fleet-sdk/core";
import { HexString, Value, ValueObj } from "sigmastate-js/main";
import { describe, expect, it, test } from "vitest";
import { compile, parseNamedConstantsMap } from "./compiler";

const compilerTestVectors = [
  {
    name: "Segregated constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "100104c801d191a37300",
    options: { segregateConstants: true, includeSize: false, map: undefined }
  },
  {
    name: "Embedded constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "00d191a304c801",
    options: { segregateConstants: false, includeSize: false, map: undefined }
  },
  {
    name: "Tree size included",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "0806d191a304c801",
    options: { segregateConstants: false, includeSize: true, map: undefined }
  },
  {
    name: "Tree size included and constant segregated",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "18090104c801d191a37300",
    options: { segregateConstants: true, includeSize: true, map: undefined }
  },
  {
    name: "Named constants",
    script: "sigmaProp(HEIGHT > deadline)",
    tree: "100104c801d191a37300",
    options: { segregateConstants: true, includeSize: false, map: { deadline: SInt(100) } }
  }
];

describe("ErgoScript Compiler", () => {
  test.each(compilerTestVectors)("Script compilation: '$name'", (tv) => {
    const tree = compile(tv.script, tv.options);

    expect(tree.toHex()).to.be.equal(tv.tree);
    expect(tree.hasSegregatedConstants).to.be.equal(tv.options.segregateConstants);
    expect(tree.hasSize).to.be.equal(tv.options.includeSize);

    if (tv.options.segregateConstants) {
      expect(tree.constants).not.to.be.empty;
    } else {
      expect(tree.constants).to.be.empty;
    }
  });

  it("Should use default if not compiler options is set", () => {
    const tree = compile("sigmaProp(HEIGHT > 100)");

    expect(tree.toHex()).to.be.equal("18090104c801d191a37300");
    expect(tree.hasSegregatedConstants).to.be.equal(true);
    expect(tree.hasSize).to.be.equal(true);
  });

  it("Should compile for testnet", () => {
    const tree = compile("sigmaProp(HEIGHT > 100)", { network: Network.Testnet });

    expect(tree.toHex()).to.be.equal("18090104c801d191a37300");
    expect(tree.hasSegregatedConstants).to.be.equal(true);
    expect(tree.hasSize).to.be.equal(true);
  });
});

describe("Compiler constants map parsing", () => {
  it("Should convert types if needed", () => {
    const parsedMap = parseNamedConstantsMap({
      fleetConst: SInt(1),
      sigmaConst: ValueObj.ofByte(1),
      hex: "0e0102" // SConstant(SColl(SByte, [0x2]))
    });

    expect(parsedMap.fleetConst).to.be.instanceOf(Value);
    expect(parsedMap.fleetConst.data).to.be.equal(1);
    expect(parsedMap.fleetConst.tpe.name).to.be.equal("Int");

    expect(parsedMap.sigmaConst).to.be.instanceOf(Value);
    expect(parsedMap.sigmaConst.data).to.be.equal(1);
    expect(parsedMap.sigmaConst.tpe.name).to.be.equal("Byte");

    expect(parsedMap.hex).to.be.instanceOf(Value);
    expect(parsedMap.hex.data).to.be.deep.equal([0x2]);
    expect(parsedMap.hex.tpe.name).to.be.equal("Coll[Byte]");
  });

  it("Should not mutate input object", () => {
    const originalMap = { test: SInt(100) };
    const parsedMap = parseNamedConstantsMap(originalMap);

    expect(originalMap).not.to.be.equal(parsedMap);
    expect(originalMap.test).to.be.deep.equal({ type: 4, value: 100 });
  });

  it("Should throw is an invalid hex string is passed", () => {
    expect(() => parseNamedConstantsMap({ invalidHex: "non-hex string" })).to.throw(
      "'non-hex string' is not a valid hex string."
    );
  });

  it("Should throw is unsupported type is passed", () => {
    expect(() => parseNamedConstantsMap({ invalidHex: 23 as unknown as HexString })).to.throw(
      "Unsupported constant object mapping."
    );
  });
});
