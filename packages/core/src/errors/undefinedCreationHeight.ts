export class UndefinedCreationHeight extends Error {
  constructor() {
    super(
      "Minting context is undefined. Transaction's inputs must be included in order to determine minting token id."
    );
  }
}
