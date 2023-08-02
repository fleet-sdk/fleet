import { SInt, SIntType } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { HexString, Value, ValueObj } from "sigmastate-js/main";
import { describe, expect, it, test } from "vitest";
import { compile, compilerDefaults, CompilerOptions, parseNamedConstantsMap } from "./compiler";

const compilerTestVectors: {
  name: string;
  script: string;
  tree: string;
  template: string;
  options: CompilerOptions;
}[] = [
  {
    name: "v0 - Segregated constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "100104c801d191a37300",
    template: "d191a37300",
    options: { version: 0, segregateConstants: true, includeSize: false }
  },
  {
    name: "v0 - Embedded constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "00d191a304c801",
    template: "d191a304c801",
    options: { version: 0, segregateConstants: false, includeSize: false }
  },
  {
    name: "v0 - Tree size included",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "0806d191a304c801",
    template: "d191a304c801",
    options: { version: 0, segregateConstants: false, includeSize: true }
  },
  {
    name: "v0 - Tree size included and constant segregated",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "18090104c801d191a37300",
    template: "d191a37300",
    options: { version: 0, segregateConstants: true, includeSize: true }
  },
  {
    name: "v0 - Named constants",
    script: "sigmaProp(HEIGHT > deadline)",
    tree: "100104c801d191a37300",
    template: "d191a37300",
    options: {
      version: 0,
      segregateConstants: true,
      includeSize: false,
      map: { deadline: SInt(100) }
    }
  },
  {
    name: "v1 - Segregated constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "19090104c801d191a37300",
    template: "d191a37300",
    options: { version: 1, segregateConstants: true }
  },
  {
    name: "v1 - Embedded constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "0906d191a304c801",
    template: "d191a304c801",
    options: { version: 1, segregateConstants: false }
  },
  {
    name: "v1 - Named constants",
    script: "sigmaProp(HEIGHT > deadline)",
    tree: "19090104c801d191a37300",
    template: "d191a37300",
    options: { version: 1, segregateConstants: true, map: { deadline: SInt(100) } }
  }
];

describe("ErgoScript Compiler", () => {
  test.each(compilerTestVectors)("Script compilation: $name", (tv) => {
    const tree = compile(tv.script, tv.options);

    expect(tree.toHex()).to.be.equal(tv.tree);
    expect(tree.template.toHex()).to.be.equal(tv.template);
    expect(hex.encode(tree.template.toBytes())).to.be.equal(tv.template);

    expect(tree.hasSegregatedConstants).to.be.equal(tv.options.segregateConstants);
    expect(tree.version).to.be.equal(tv.options.version);

    if (tv.options.version === 1) {
      expect(tree.hasSize).to.be.true;
    } else if (tv.options.version === 0) {
      expect(tree.hasSize).to.be.equal(tv.options.includeSize);
    }

    if (tv.options.segregateConstants) {
      expect(tree.constants).not.to.be.empty;
    } else {
      expect(tree.constants).to.be.empty;
    }
  });

  it("Should use default if not compiler options is set", () => {
    const { version, segregateConstants } = compilerDefaults;

    const tree = compile("sigmaProp(HEIGHT > 100)");
    expect(tree.toHex()).to.be.equal("19090104c801d191a37300");
    expect(tree.hasSegregatedConstants).to.be.equal(segregateConstants);
    expect(tree.version).to.be.equal(version);
    expect(tree.hasSize).to.be.equal(
      version > 0 || (version === 0 && compilerDefaults.includeSize)
    );
  });

  it("Should throw if version is greater than max supported", () => {
    expect(() =>
      compile("sigmaProp(HEIGHT > 100)", {
        version: 10
      } as unknown as CompilerOptions)
    ).to.throw("Version should be lower than 8, got 10");
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
    expect(originalMap.test).to.be.deep.equal({ type: SIntType, value: 100 });
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
