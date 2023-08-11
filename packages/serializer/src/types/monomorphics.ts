import { SMonomorphicType } from "./base";

export class SUnitType extends SMonomorphicType<undefined> {
  get code(): number {
    return 0x62;
  }
}
