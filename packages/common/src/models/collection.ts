import type { OneOrMore } from "../types";
import { isDefined } from "../utils";

export type CollectionAddOptions = { index?: number };

/**
 * Collection abstract model
 *
 * @example
 * Define a new collection class with internal type `number` and external type `string`
 * ```
 * class TestCollection extends Collection<number, string> {
 *    protected _map(item: string | number): number {
 *      return Number(item);
 *    }
 *    // Some other methods
 *  }
 * ```
 *
 */
export abstract class Collection<InternalType, ExternalType>
  implements Iterable<InternalType>
{
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

  /**
   * Number of items in the collection
   */
  public get length(): number {
    return this._items.length;
  }

  /**
   * True if the collection is empty
   */
  public get isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Get item at index
   * @param index
   * @throws RangeError if index is out of bounds
   */
  public at(index: number): InternalType {
    if (this._isIndexOutOfBounds(index)) {
      throw new RangeError(`Index '${index}' is out of range.`);
    }

    return this._items[index];
  }

  /**
   * Add item to the collection
   * @param items
   * @param options
   * @returns The new length of the collection
   */
  public add(
    items: OneOrMore<ExternalType>,
    options?: CollectionAddOptions
  ): number {
    return this._addOneOrMore(items, options);
  }

  abstract remove(item: unknown): number;

  /**
   * Map external type to internal type
   * @param item
   * @protected
   */
  protected abstract _map(item: ExternalType | InternalType): InternalType;

  protected _addOne(
    item: InternalType | ExternalType,
    options?: CollectionAddOptions
  ): number {
    if (isDefined(options) && isDefined(options.index)) {
      if (options.index === this.length) {
        this._items.push(this._map(item));

        return this.length;
      }

      if (this._isIndexOutOfBounds(options.index)) {
        throw new RangeError(`Index '${options.index}' is out of range.`);
      }

      this._items.splice(options.index, 0, this._map(item));

      return this.length;
    }

    this._items.push(this._map(item));

    return this._items.length;
  }

  protected _addOneOrMore(
    items: OneOrMore<ExternalType>,
    options?: CollectionAddOptions
  ): number {
    if (Array.isArray(items)) {
      if (isDefined(options) && isDefined(options.index)) {
        items = items.reverse();
      }

      for (const item of items) {
        this._addOne(item, options);
      }
    } else {
      this._addOne(items, options);
    }

    return this.length;
  }

  /**
   * Get the collection as an array
   */
  public toArray(): InternalType[] {
    return [...this._items];
  }

  public reduce<U>(
    callbackFn: (
      accumulator: U,
      currentValue: InternalType,
      currentIndex: number,
      array: InternalType[]
    ) => U,
    initialValue: U
  ): U {
    return this._items.reduce(callbackFn, initialValue);
  }
}
