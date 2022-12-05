import { HexString } from "./common";
import { ContextExtension } from "./contextExtension";

export type ProverResult = {
  readonly proofBytes: HexString;
  readonly extension: ContextExtension;
};
