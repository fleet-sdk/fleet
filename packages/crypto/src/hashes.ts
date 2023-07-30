import { blake2b } from "@noble/hashes/blake2b";
import { sha256 as nobleSha256 } from "@noble/hashes/sha256";
import { BytesInput } from "./types";

export const blake2b256 = (message: BytesInput) => blake2b(message, { dkLen: 32 });

export const sha256 = nobleSha256 as (message: BytesInput) => Uint8Array;
