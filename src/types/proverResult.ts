import { ContextExtension } from "./contextExtension";
import { HexString } from "./common";

export type ProverResult = {
  readonly proofBytes: HexString;
  readonly extension: ContextExtension;
};
