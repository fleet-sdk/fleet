import { assert, ergoTreeHeaderFlags, isEmpty, isHex, Network } from "@fleet-sdk/common";
import { ISigmaType, SConstant } from "@fleet-sdk/core";
import {
  SigmaCompilerNamedConstantsMap,
  SigmaCompilerObj,
  Value as SigmaValue,
  ValueObj
} from "sigmastate-js/main";
import { CompilerOutput } from "./compilerOutput";

export type CompilerOptions = {
  map?: NamedConstantsMap;
  segregateConstants?: boolean;
  includeSize?: boolean;
  network?: Network;
};

export type NamedConstantsMap = {
  [key: string]: string | ISigmaType | SigmaValue;
};

export function compile(script: string, options: CompilerOptions = {}): CompilerOutput {
  const {
    map = options.map ?? {},
    segregateConstants = options.segregateConstants ?? true,
    network = options.network ?? Network.Mainnet,
    includeSize = options.includeSize ?? true
  } = options;

  const headerFlags = includeSize ? ergoTreeHeaderFlags.sizeInclusion : 0x00;
  const tree = constructCompiler(network).compile(
    parseNamedConstantsMap(map),
    segregateConstants,
    headerFlags,
    script
  );

  return new CompilerOutput(tree);
}

function constructCompiler(network: Network) {
  return network === Network.Mainnet
    ? SigmaCompilerObj.forMainnet()
    : SigmaCompilerObj.forTestnet();
}

export function parseNamedConstantsMap(map: NamedConstantsMap): SigmaCompilerNamedConstantsMap {
  if (isEmpty(map)) {
    return map;
  }

  const sigmaMap: SigmaCompilerNamedConstantsMap = {};
  for (const key in map) {
    sigmaMap[key] = toSigmaConstant(map[key]);
  }

  return sigmaMap;
}

export function toSigmaConstant(constant: string | ISigmaType | SigmaValue): SigmaValue {
  if (typeof constant === "string") {
    assert(isHex(constant), `'${constant}' is not a valid hex string.`);

    return ValueObj.fromHex(constant);
  } else if (isFleetSigmaConstant(constant)) {
    return ValueObj.fromHex(SConstant(constant));
  } else if (constant instanceof SigmaValue) {
    return constant;
  }

  throw new Error("Unsupported constant object mapping.");
}

function isFleetSigmaConstant(constant: unknown): constant is ISigmaType {
  return typeof (constant as ISigmaType).type === "number";
}
