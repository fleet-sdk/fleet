import { SGenericType, SType } from "./base";
import { descriptors } from "./descriptors";

export class SCollType<T extends SType = SType> extends SGenericType<T> {
  get code(): number {
    return descriptors.coll.code;
  }
}

export class STupleType<T extends SType[] = SType[]> extends SGenericType<T> {
  get code(): number {
    return descriptors.tuple.code;
  }
}
