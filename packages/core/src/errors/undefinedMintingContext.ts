export class UndefinedMintingContext extends Error {
  constructor() {
    super("Creation Height is undefined.");
  }
}
