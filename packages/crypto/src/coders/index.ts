import {
  base58check as base58checkCoder,
  base58 as base58Coder,
  base64 as base64Coder
} from "@scure/base";
import { sha256 } from "../hashes";
import type { BytesCoder } from "../types";

export const base58check = base58checkCoder(sha256);
export const base58 = base58Coder as BytesCoder;
export const base64 = base64Coder as BytesCoder;

export { hex } from "./hex";
export { utf8 } from "./utf8";
export { bigintBE } from "./bigintBE";
