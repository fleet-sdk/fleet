export type InsufficientInputs = { [key: string]: bigint };

export class InsufficientInputsError extends Error {
  readonly unreached: InsufficientInputs;

  constructor(unreached: InsufficientInputs) {
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
