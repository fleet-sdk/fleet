import { blake2b } from "@noble/hashes/blake2b";
import { sha256 as _sha256 } from "@noble/hashes/sha256";
import { hex } from "./coders";
import { BytesInput } from "./types";

export function ensureBytes(input: BytesInput): Uint8Array {
  return typeof input === "string" ? hex.decode(input) : input;
}

export function blake2b256(message: BytesInput): Uint8Array {
  return blake2b(ensureBytes(message), { dkLen: 32 });
}

export function sha256(message: BytesInput): Uint8Array {
  return _sha256(ensureBytes(message));
}
