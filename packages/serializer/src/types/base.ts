export abstract class SType<I = unknown, O = I> {
  abstract get code(): number;
  abstract get embeddable(): boolean;

  coerce(data: I): O {
    // a bit hacky but most of types will not need a specific coercion function.
    return data as unknown as O;
  }

  abstract toString(): string;
}

export abstract class SMonomorphicType<I, O = I> extends SType<I, O> {
  abstract get code(): number;

  get embeddable(): boolean {
    return false;
  }
}

export abstract class SPrimitiveType<I, O = I> extends SMonomorphicType<I, O> {
  abstract get code(): number;

  override get embeddable(): boolean {
    return true;
  }
}

export abstract class SGenericType<T extends SType | SType[]> extends SType {
  readonly #internalType: T;

  constructor(type: T) {
    super();
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
