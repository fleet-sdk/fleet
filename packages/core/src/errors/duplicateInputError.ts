export class DuplicateInputError extends Error {
  constructor(boxId: string) {
    super(`Box '${boxId}' is already included.`);
  }
}
