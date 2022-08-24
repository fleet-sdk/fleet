export type InsufficientAssets = { [key: string]: bigint };

export class InsufficientInputs extends Error {
  readonly unreached: InsufficientAssets;

  constructor(unreached: InsufficientAssets) {
    super(
      `Insufficient inputs:${Object.keys(unreached)
        .map((key) => {
          return `\n  > ${key}: ${unreached[key].toString()}`;
        })
        .join()}`
    );

    this.unreached = unreached;
  }
}
