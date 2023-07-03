/* eslint-disable @typescript-eslint/naming-convention */
declare module "sigmastate-js/main" {
  type SigmaCompilerConstantMap = { [key: string]: Value };

  class ErgoTreeValue {
    toHex(): string;
    toBytes(): { u: Uint8Array };
  }

  class Type {
    name: string;
    toString(): string;
  }

  class TypeObj {
    static Byte: Type;
    static Short: Type;
    static Int: Type;
    static Long: Type;
    static pairType(left: Type, right: Type): Type;
    static collType(elemType: Type): Type;
  }

  class Value<T = unknown> {
    data: T;
    tpe: Type;
    toHex(): string;
  }

  class ValueObj<T = unknown> {
    static ofByte(value: number): Value<T>;
    static ofShort(value: number): Value<T>;
    static ofInt(value: number): Value<T>;
    static ofLong(value: bigint): Value<T>;
    static pairOf(left: Value, right: Value): Value<T>;
    static collOf(items: T[], type: Type): Value<T>;
    static fromHex(hex: string): Value<T>;
  }

  class SigmaCompiler {
    compile(
      namedConstants: SigmaCompilerConstantMap,
      segregateConstants: boolean,
      additionalHeaderFlags: number,
      ergoScript: string
    ): ErgoTreeValue;
  }

  class SigmaCompilerObj {
    static forMainnet(): SigmaCompiler;
    static forTestnet(): SigmaCompiler;
  }
}
