import { Values } from "sigmastate-js/main";
import { HexString } from "../../types";
import { DataSerializer } from "./dataSerializer";
import { SigmaBuffer } from "./sigmaBuffer";
import { ISigmaType } from "./sigmaTypes";
import { TypeSerializer } from "./typeSerializer";

export const MAX_CONSTANT_TYPES_LENGTH = 100;
export const MAX_CONSTANT_CONTENT_LENGTH = 4096;
export const MAX_CONSTANT_LENGTH = MAX_CONSTANT_TYPES_LENGTH + MAX_CONSTANT_CONTENT_LENGTH;

export class SigmaConstant<T> {
  private _value: any;

  private constructor(value: any) {
    this._value = value;
  }

  public get data(): T {
    return this._value.data;
  }

  public get type(): string {
    return this._value.tpe.name;
  }

  public static fromHex<T>(hex: string): SigmaConstant<T> {
    return new SigmaConstant(Values.fromHex(hex));
    // console.log(Values);
    // const value = Values.fromHex(hex);
    // console.log(value.data);
    // console.log(value.tpe.name);

    // return this;
  }
}

export function SConstant(content: ISigmaType): HexString {
  const sigmaBuffer = new SigmaBuffer(MAX_CONSTANT_LENGTH);
  TypeSerializer.serialize(content, sigmaBuffer);
  DataSerializer.serialize(content, sigmaBuffer);

  return sigmaBuffer.toHex();
}
