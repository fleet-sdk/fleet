import { randomBytes as nobleRandomBytes } from "@noble/hashes/utils";

/**
 * Secure PRNG from "@noble/hashes". Uses crypto.getRandomValues, which defers to OS.
 */
export const randomBytes = nobleRandomBytes as (bytesLength?: number) => Uint8Array;

export * from "./hashes";
export * from "./types";
export * from "./coders";
