export abstract class SType {
  abstract get code(): number;
  abstract get embeddable(): boolean;
}

export abstract class SMonomorphicType<I, O = I> implements SType {
  abstract get code(): number;

  get embeddable(): boolean {
    return false;
  }

  coerce(data: I): O {
    // a bit hacky but most of types will not need an specific coercion function.
    return data as unknown as O;
  }
}

export abstract class SPrimitiveType<I, O = I> extends SMonomorphicType<I, O> {
  abstract get code(): number;

  override get embeddable(): boolean {
    return true;
  }
}

export abstract class SGenericType<T extends SType | SType[]> implements SType {
  readonly #internalType: T;

  constructor(type: T) {
    this.#internalType = type;
  }

  abstract get code(): number;

  get elementsType(): T {
    return this.#internalType;
  }

  get embeddable(): boolean {
    return false;
  }
}
