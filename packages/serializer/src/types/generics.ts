import { hex } from "@fleet-sdk/crypto";
import { SGenericType, SType } from "./base";
import { descriptors } from "./descriptors";

export class SCollType<T extends SType = SType> extends SGenericType<T> {
  get code(): number {
    return descriptors.coll.code;
  }

  override coerce<I, O>(elements: I[]): O[] | Uint8Array {
    if (this.elementsType.code === descriptors.byte.code && !(elements instanceof Uint8Array)) {
      return typeof elements === "string"
        ? hex.decode(elements)
        : Uint8Array.from(elements as ArrayLike<number>);
    }

    return elements.map((el) => this.elementsType.coerce(el)) as O[];
  }
}

export class STupleType<T extends SType[] = SType[]> extends SGenericType<T> {
  get code(): number {
    return descriptors.tuple.code;
  }

  override coerce<I, O>(elements: I[]): O[] {
    const output = new Array(elements.length);
    for (let i = 0; i < elements.length; i++) {
      output[i] = this.elementsType[i].coerce(elements[i]);
    }

    return output;
  }
}
