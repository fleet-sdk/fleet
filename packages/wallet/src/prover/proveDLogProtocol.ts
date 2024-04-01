import { concatBytes } from "@fleet-sdk/common";
import { blake2b256, hex, randomBytes } from "@fleet-sdk/crypto";
import { schnorr, secp256k1 } from "@noble/curves/secp256k1";

const { ProjectivePoint: ECPoint, CURVE } = secp256k1;
const { numberToBytesBE, bytesToNumberBE, mod } = schnorr.utils;
const G = ECPoint.BASE;

const BLAKE2B_256_DIGEST_LEN = 32;
const ERGO_SOUNDNESS_BYTES = 24;
const ERGO_SCHNORR_SIG_LEN = BLAKE2B_256_DIGEST_LEN + ERGO_SOUNDNESS_BYTES;
const MAX_ITERATIONS = 100;

/**
 * Generates a Schnorr signature for the given message using the provided secret key.
 * @param message - The message to be signed.
 * @param secretKey - The secret key used for signing.
 * @returns The generated signature.
 * @throws Error if the signature generation fails after the maximum number of iterations.
 */
export function sign(message: Uint8Array, secretKey: Uint8Array) {
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const signature = genSignature(message, secretKey);
    if (signature) return signature;
  }

  throw new Error("Failed to generate signature");
}

/**
 * Generates a Schnorr signature for the given message using the provided secret key.
 *
 * @param message - The message to be signed.
 * @param secretKey - The secret key used for signing.
 * @returns The generated signature as a Uint8Array, or null if the verification fails.
 * @throws Error if failed to generate commitment.
 */
export function genSignature(message: Uint8Array, secretKey: Uint8Array): null | Uint8Array {
  const sk = bytesToNumberBE(secretKey);
  const y = genY();
  const w = G.multiply(y).toRawBytes();
  const pk = G.multiply(sk).toRawBytes();
  const s = concatBytes(genCommitment(pk, w), message);
  const c = numHash(s);
  if (c === 0n) throw new Error("Failed to generate commitment");
  const z = mod(sk * c + y, CURVE.n);

  const cb = numberToBytesBE(c, ERGO_SOUNDNESS_BYTES);
  const zb = numberToBytesBE(z, BLAKE2B_256_DIGEST_LEN);
  const signature = concatBytes(cb, zb);

  if (!verify(message, signature, pk)) return null;
  return signature;
}

/**
 * Generates a random value y within the range [1, CURVE.n].
 *
 * @returns The generated value y.
 * @throws Error if failed to generate y after reaching the maximum number of iterations.
 */
function genY() {
  let y = 0n;
  let c = 0;

  while (y === 0n && c < MAX_ITERATIONS) {
    y = mod(bytesToNumberBE(randomBytes(32)), CURVE.n);
    c++;
  }

  if (y === 0n) throw new Error("Failed to generate y");
  return y;
}

/**
 * Verifies the Schnorr signature for a given message using the provided public key and signature.
 * @param message - The message to be verified.
 * @param signature - The signature to be verified.
 * @param publicKey - The public key corresponding to the private key used to generate the signature.
 * @returns A boolean indicating whether the signature is valid or not.
 */
export function verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
  if (signature.length !== ERGO_SCHNORR_SIG_LEN) return false;

  const c = bytesToNumberBE(signature.slice(0, ERGO_SOUNDNESS_BYTES));
  const z = bytesToNumberBE(signature.slice(ERGO_SOUNDNESS_BYTES, ERGO_SCHNORR_SIG_LEN));

  const t = ECPoint.fromHex(publicKey).multiply(CURVE.n - c);
  const w = G.multiply(z).add(t).toRawBytes();
  const s = concatBytes(genCommitment(publicKey, w), message);

  return numHash(s) === c;
}

/**
 * Computes the numeric hash of a given message.
 *
 * @param message - The message to be hashed.
 * @returns The numeric hash of the message.
 */
function numHash(message: Uint8Array) {
  return bytesToNumberBE(blake2b256(message).slice(0, ERGO_SOUNDNESS_BYTES));
}

const COMMITMENT_PREFIX = hex.decode("010027100108cd");
const COMMITMENT_SUFFIX = hex.decode("73000021");

/**
 * Compute commitment prefix P(c) = H(prefix || pk || postfix || w)
 */
function genCommitment(pk: Uint8Array, w: Uint8Array) {
  return concatBytes(COMMITMENT_PREFIX, pk, COMMITMENT_SUFFIX, w);
}
