import type { HexString } from "./common";

export type NonMandatoryRegisters<T = HexString> = {
  R4?: T;
  R5?: T;
  R6?: T;
  R7?: T;
  R8?: T;
  R9?: T;
};
