import { MAX_TOKENS_PER_BOX } from "../models/collections/tokensCollection";

export class MaxTokensOverflow extends Error {
  constructor() {
    super(
      `A box must contain no more than ${MAX_TOKENS_PER_BOX} distinct tokens.`
    );
  }
}
