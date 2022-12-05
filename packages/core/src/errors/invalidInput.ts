export class InvalidInput extends Error {
  constructor(boxId: string) {
    super(`Invalid input: ${boxId}`);
  }
}
