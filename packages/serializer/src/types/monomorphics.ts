import { SMonomorphicType } from "./base";

export class SUnitType extends SMonomorphicType<undefined> {
  get code(): 0x62 {
    return 0x62;
  }

  toString(): string {
    return "SUnit";
  }
}
