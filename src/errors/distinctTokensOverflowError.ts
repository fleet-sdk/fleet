import { MAX_DISTINCT_TOKENS_PER_BOX } from "../builder/outputBuilder";

export class DistinctTokensOverflowError extends Error {
  constructor() {
    super(`A box must contains no more than ${MAX_DISTINCT_TOKENS_PER_BOX} distinct tokens.`);
  }
}
