export class InvalidAddressError extends Error {
  constructor(address: string) {
    super(`Invalid Ergo address: ${address}`);
  }
}
