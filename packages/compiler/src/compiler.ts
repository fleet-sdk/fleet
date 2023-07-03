import { HexString, isEmpty, Network } from "@fleet-sdk/common";
import { ISigmaType, SBool, SColl, SConstant } from "@fleet-sdk/core";
import {
  ErgoTreeValue,
  SigmaCompilerConstantMap,
  SigmaCompilerObj,
  Value as SigmaValue,
  TypeObj,
  ValueObj
} from "sigmastate-js/main";

export type CompilerOptions = {
  map?: CompilerConstantMap;
  segregateConstants?: boolean;
  network?: Network;
  additionalHeaderFlags?: number;
};

type CompilerConstantMapInput =
  | string
  | number
  | bigint
  | boolean
  | ArrayLike<number>
  | ArrayLike<boolean>
  | ISigmaType
  | SigmaValue;

export type CompilerConstantMap = {
  [key: string]: CompilerConstantMapInput;
};

export class ErgoTree {
  private readonly _tree: ErgoTreeValue;

  constructor(tree: ErgoTreeValue) {
    this._tree = tree;
  }

  toBytes(): Uint8Array {
    return Uint8Array.from(this._tree.toBytes().u);
  }

  toHex(): HexString {
    return this._tree.toHex();
  }
}

export function compile(script: string, options: CompilerOptions = {}): ErgoTree {
  const {
    map = options.map ?? {},
    segregateConstants = options.segregateConstants ?? true,
    network = options.network ?? Network.Mainnet,
    additionalHeaderFlags = options.additionalHeaderFlags ?? 0x0
  } = options;

  const compiler = constructCompiler(network);

  return new ErgoTree(
    compiler.compile(parseMap(map), segregateConstants, additionalHeaderFlags, script)
  );
}

function constructCompiler(network: Network) {
  return network === Network.Mainnet
    ? SigmaCompilerObj.forMainnet()
    : SigmaCompilerObj.forTestnet();
}

function parseMap(map: CompilerConstantMap) {
  if (isEmpty(map)) {
    return map;
  }

  const sigmaMap: SigmaCompilerConstantMap = {};
  for (const key in map) {
    sigmaMap[key] = parseConstant(map[key]);
  }

  return sigmaMap;
}

function parseConstant(value: CompilerConstantMapInput): SigmaValue {
  switch (typeof value) {
    case "string":
      // todo: add hex validation
      return ValueObj.fromHex(value);
    case "number":
      // todo: check proper sigma type
      return ValueObj.ofInt(value);
    case "bigint":
      // todo: check proper sigma type
      return ValueObj.ofLong(value);
    case "boolean":
      return ValueObj.fromHex(SConstant(SBool(value)));
    default: {
      if (Array.isArray(value)) {
        if (value.every((x): x is number => typeof x === "number")) {
          return ValueObj.collOf(value, TypeObj.Int);
        } else if (value.every((x): x is boolean => typeof x === "boolean")) {
          return ValueObj.fromHex(SConstant(SColl(SBool, value)));
        }
      } else if (value instanceof SigmaValue) {
        return value;
      } else if (isSigmaType(value)) {
        return ValueObj.fromHex(SConstant(value));
      }
    }
  }

  throw new Error("Unsupported constant mapping.");
}

function isSigmaType(constant: unknown): constant is ISigmaType {
  return typeof (constant as ISigmaType).type === "number";
}
