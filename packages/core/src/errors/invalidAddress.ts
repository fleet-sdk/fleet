export class InvalidAddress extends Error {
  constructor(address: string) {
    super(`Invalid Ergo address: ${address}`);
  }
}
