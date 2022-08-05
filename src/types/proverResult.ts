import { ContextExtension } from "./context-extension";
import { HexString } from "./primitives";

export type ProverResult = {
  readonly proofBytes: HexString;
  readonly extension: ContextExtension;
};
