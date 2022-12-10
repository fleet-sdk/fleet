export abstract class Collection<InternalType, ExternalType> implements Iterable<InternalType> {
  protected readonly _items: InternalType[];

  constructor() {
    this._items = [];
  }

  protected _isIndexOutOfBounds(index: number): boolean {
    return index < 0 || index >= this._items.length;
  }

  [Symbol.iterator](): Iterator<InternalType> {
    let counter = 0;

    return {
      next: () => {
        return {
          done: counter >= this.length,
          value: this._items[counter++]
        };
      }
    };
  }

  public get length(): number {
    return this._items.length;
  }

  public get isEmpty(): boolean {
    return this.length === 0;
  }

  public add(items: ExternalType[] | ExternalType): number {
    return this._addOneOrMore(items);
  }

  abstract remove(item: unknown): number;

  protected abstract _addOne(item: ExternalType, options?: unknown): number;

  protected _addOneOrMore(items: ExternalType[] | ExternalType, options?: unknown): number {
    if (Array.isArray(items)) {
      for (const item of items) {
        this._addOne(item, options);
      }
    } else {
      this._addOne(items, options);
    }

    return this.length;
  }

  public toArray(): InternalType[] {
    return [...this._items];
  }
}
