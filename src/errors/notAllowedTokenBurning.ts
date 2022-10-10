export type InsufficientAssets = { [key: string]: bigint };

export class NotAllowedTokenBurning extends Error {
  constructor() {
    super(
      "This transaction is trying to burn tokens. If that's your intention you must explicitly allow token burning on TransactionBuilder.configure() method. If no, a change address should be provided."
    );
  }
}
