import { HexString } from "@fleet-sdk/common";
import { SigmaConstant } from "./sigmaTypes";

export function SParse<T>(content: HexString | Uint8Array): T {
  return SigmaConstant.from<T>(content).data;
}
