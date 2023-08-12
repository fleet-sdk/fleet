import { assert, ensureDefaults, ergoTreeHeaderFlags, isEmpty, isHex } from "@fleet-sdk/common";
import { SConstant } from "@fleet-sdk/serializer";
import {
  SigmaCompilerNamedConstantsMap,
  SigmaCompilerObj,
  Value as SigmaValue,
  ValueObj
} from "sigmastate-js/main";
import { CompilerOutput } from "./compilerOutput";

type CompilerOptionsBase = {
  version?: number;
  map?: NamedConstantsMap;
  segregateConstants?: boolean;
};

export type CompilerOptionsForErgoTreeV0 = CompilerOptionsBase & {
  version?: 0;
  includeSize?: boolean;
};

export type CompilerOptionsForErgoTreeV1 = CompilerOptionsBase & {
  version?: 1;
};

export type CompilerOptions = CompilerOptionsForErgoTreeV0 | CompilerOptionsForErgoTreeV1;

export type NamedConstantsMap = {
  [key: string]: string | SigmaValue | SConstant;
};

export const compilerDefaults: Required<CompilerOptions> = {
  version: 1,
  map: {},
  segregateConstants: true
};

export function compile(script: string, options?: CompilerOptions): CompilerOutput {
  const opt = ensureDefaults(options, compilerDefaults);
  assert(opt.version < 8, `Version should be lower than 8, got ${opt.version}`);

  let headerFlags = 0x00 | opt.version;

  if (opt.version > 0 || (opt.version == 0 && opt.includeSize)) {
    headerFlags |= ergoTreeHeaderFlags.sizeInclusion;
  }

  const tree = SigmaCompilerObj.forMainnet().compile(
    parseNamedConstantsMap(opt.map),
    opt.segregateConstants,
    headerFlags,
    script
  );

  return new CompilerOutput(tree);
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

export function toSigmaConstant(constant: string | SigmaValue | SConstant): SigmaValue {
  if (typeof constant === "string") {
    assert(isHex(constant), `'${constant}' is not a valid hex string.`);

    return ValueObj.fromHex(constant);
  } else if (constant instanceof SConstant) {
    return ValueObj.fromHex(constant.toHex());
  } else if (constant instanceof SigmaValue) {
    return constant;
  }

  throw new Error("Unsupported constant object mapping.");
}
