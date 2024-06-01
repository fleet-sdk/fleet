import { blake2b } from "@noble/hashes/blake2b";
import { sha256 as _sha256 } from "@noble/hashes/sha256";
import { hex } from "./coders";
import { BytesInput } from "./types";

/**
 * Ensure that the input is a Uint8Array, if not convert it to one
 * @param input
 */
function ensureBytes(input: BytesInput): Uint8Array {
  if (input instanceof Uint8Array) return input;

  return hex.decode(input);
}

/**
 * Get the blake2b-256 hash of the input
 * @param message
 */
export function blake2b256(message: BytesInput): Uint8Array {
  return blake2b(ensureBytes(message), { dkLen: 32 });
}

/**
 * Get the sha256 hash of the input
 * @param message
 */
export function sha256(message: BytesInput): Uint8Array {
  return _sha256(ensureBytes(message));
}
