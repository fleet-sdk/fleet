import { type Blake2Opts, blake2b as _blake2b } from "@noble/hashes/blake2.js";
import { sha256 as _sha256 } from "@noble/hashes/sha2.js";
import { hex } from "./coders";
import type { ByteInput } from "./types";

export type Blake2b256Options = {
  key?: ByteInput;
  salt?: ByteInput;
  personalization?: ByteInput;
};

export type Blake2bOptions = Blake2b256Options & {
  dkLen?: number;
};

export function ensureBytes(input: ByteInput): Uint8Array {
  return typeof input === "string" ? hex.decode(input) : input;
}

export function blake2b(message: ByteInput, options?: Blake2bOptions): Uint8Array {
  if (options?.key) options.key = ensureBytes(options.key);
  if (options?.salt) options.salt = ensureBytes(options.salt);
  if (options?.personalization) options.personalization = ensureBytes(options.personalization);

  const opts: Blake2Opts = {
    key: options?.key ? ensureBytes(options?.key) : undefined,
    salt: options?.salt ? ensureBytes(options?.salt) : undefined,
    personalization: options?.personalization ? ensureBytes(options?.personalization) : undefined,
    dkLen: options?.dkLen
  };
  return _blake2b(ensureBytes(message), opts);
}

export function blake2b256(message: ByteInput, options?: Blake2b256Options): Uint8Array {
  return blake2b(message, { dkLen: 32, ...options });
}

export function sha256(message: ByteInput): Uint8Array {
  return _sha256(ensureBytes(message));
}
