import { ContextExtension } from "./contextExtension";
import { HexString } from "./primitives";

export type ProverResult = {
  readonly proofBytes: HexString;
  readonly extension: ContextExtension;
};
