export class MalformedTransaction extends Error {
  constructor(message: string) {
    super(`Malformed transaction: ${message}`);
  }
}
