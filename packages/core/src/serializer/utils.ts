import { blake2b } from "@noble/hashes/blake2b";

export const BLAKE_256_HASH_LENGTH = 32;

export function blake2b256(input: Uint8Array): Uint8Array {
  return blake2b(input, { dkLen: BLAKE_256_HASH_LENGTH });
}
