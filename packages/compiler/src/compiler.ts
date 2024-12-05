import {
  assert,
  ensureDefaults,
  ergoTreeHeaderFlags,
  isEmpty,
  isHex,
  Network
} from "@fleet-sdk/common";
import { SConstant } from "@fleet-sdk/serializer";
import {
  SigmaCompiler$,
  type SigmaCompilerNamedConstantsMap,
  Value,
  Value$
} from "sigmastate-js/main";
import { CompilerOutput } from "./compilerOutput";

export type NamedConstantsMap = {
  [key: string]: string | Value | SConstant;
};

type CompilerOptionsBase = {
  /**
   * Optional version number of the ErgoTree output.
   * @default 1
   */
  version?: number;

  /**
   * Map of named constants.
   * @default {}
   */
  map?: NamedConstantsMap;

  /**
   * Segregate Sigma constants in the ErgoTree output.
   * @default true
   */
  segregateConstants?: boolean;

  /**
   * Network type, either "mainnet" or "testnet".
   * @default "mainnet"
   */
  network?: "mainnet" | "testnet";
};

export type CompilerOptionsForErgoTreeV0 = CompilerOptionsBase & {
  version?: 0;

  /**
   * Include size in the ErgoTree header.
   * @default false
   */
  includeSize?: boolean;
};

export type CompilerOptionsForErgoTreeV1 = CompilerOptionsBase & {
  version?: 1;
};

export type CompilerOptions = CompilerOptionsForErgoTreeV0 | CompilerOptionsForErgoTreeV1;

export const compilerDefaults: Required<CompilerOptions> = {
  version: 1,
  map: {},
  segregateConstants: true,
  network: "mainnet"
};

/**
 * Compiles a given ErgoScript with specified compiler options.
 *
 * @param script - The script to be compiled.
 * @param options - Optional compiler options to customize the compilation process.
 * @returns The output of the compilation process.
 */
export function compile(script: string, options?: CompilerOptions): CompilerOutput {
  const opt = ensureDefaults(options, compilerDefaults);
  assert(opt.version < 8, `Version should be lower than 8, got ${opt.version}`);

  let headerFlags = 0x00 | opt.version;
  if (opt.version > 0 || (opt.version === 0 && opt.includeSize)) {
    headerFlags |= ergoTreeHeaderFlags.sizeInclusion;
  }

  const compiler =
    opt.network === "mainnet" ? SigmaCompiler$.forMainnet() : SigmaCompiler$.forTestnet();

  const tree = compiler.compile(
    parseNamedConstantsMap(opt.map),
    opt.segregateConstants,
    headerFlags,
    script
  );

  return new CompilerOutput(
    tree,
    opt.network === "mainnet" ? Network.Mainnet : Network.Testnet
  );
}

export function parseNamedConstantsMap(
  map: NamedConstantsMap
): SigmaCompilerNamedConstantsMap {
  if (isEmpty(map)) return map;

  const sigmaMap: SigmaCompilerNamedConstantsMap = {};
  for (const key in map) sigmaMap[key] = toSigmaConstant(map[key]);

  return sigmaMap;
}

export function toSigmaConstant(constant: string | Value | SConstant): Value {
  if (typeof constant === "string") {
    assert(isHex(constant), `'${constant}' is not a valid hex string.`);
    return Value$.fromHex(constant);
  }
  if (constant instanceof SConstant) return Value$.fromHex(constant.toHex());
  if (constant instanceof Value) return constant;

  throw new Error("Unsupported constant object mapping.");
}
