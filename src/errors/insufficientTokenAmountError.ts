export class InsufficientTokenAmountError extends Error {
  constructor(message: string) {
    super(message);
  }
}
