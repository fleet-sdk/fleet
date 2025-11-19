import { FleetError, _0n, concatBytes } from "@fleet-sdk/common";
import { bigintBE, blake2b256, hex, randomBytes, validateEcPoint } from "@fleet-sdk/crypto";
import { secp256k1 } from "@noble/curves/secp256k1.js";

const { Point } = secp256k1;
const G = Point.BASE;
const N = Point.CURVE().n;

const BLAKE2B_256_DIGEST_LEN = 32;
const ERGO_SOUNDNESS_BYTES = 24;
const ERGO_SCHNORR_SIG_LEN = BLAKE2B_256_DIGEST_LEN + ERGO_SOUNDNESS_BYTES;
const MAX_ITERATIONS = 100;

/**
 * Generates a Schnorr signature for the given message using the provided secret key.
 * @param message - The message to be signed.
 * @param secretKey - The secret key used for signing.
 * @returns The generated signature.
 * @throws FleetError if the signature generation fails after the maximum number of iterations.
 */
export function sign(message: Uint8Array, secretKey: Uint8Array) {
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const signature = genSignature(message, secretKey);
    /* v8 ignore else -- @preserve */
    if (signature) return signature;
  }

  // This branch is ignored in the coverage report because it depends on randomness.
  /* v8 ignore next -- @preserve */
  throw new FleetError("Failed to generate signature");
}

/**
 * Generates a Schnorr signature for the given message using the provided secret key.
 *
 * @param message - The message to be signed.
 * @param secretKey - The secret key used for signing.
 * @returns The generated signature as a Uint8Array, or undefined if the verification fails.
 * @throws Error if failed to generate commitment.
 */
export function genSignature(message: Uint8Array, secretKey: Uint8Array): undefined | Uint8Array {
  const sk = bigintBE.encode(secretKey);
  const pk = G.multiply(sk).toBytes();
  const k = genRandomSecret();
  const w = G.multiply(k).toBytes();
  const c = fiatShamirHash(genCommitment(pk, w, message));

  // The next line is ignored in the coverage report because it depends on randomness.
  /* v8 ignore next -- @preserve */
  if (c === 0n) throw new FleetError("Failed to generate challenge");

  const z = umod(sk * c + k, N);
  const signature = concatBytes(bigintBE.decode(c), bigintBE.decode(z));

  // The next line is ignored in the coverage report because it depends on randomness.
  /* v8 ignore next -- @preserve */
  if (!verify(message, signature, pk)) return;

  return signature;
}

/**
 * Generates a random value within the range [1, CURVE.n].
 *
 * @returns The generated value.
 * @throws FleetError if failed to generate after reaching the maximum number of iterations.
 */
function genRandomSecret() {
  let r = 0n;
  let c = 0;

  while (r === 0n && c < MAX_ITERATIONS) {
    r = umod(bigintBE.encode(randomBytes(32)), N);
    c++;
  }

  // The next line is ignored in the coverage report because it depends on randomness.
  /* v8 ignore next -- @preserve */
  if (r === 0n) throw new FleetError("Failed to generate randomness");

  return r;
}

/**
 * Calculates the unsigned modulo of two bigint values.
 * @param a - The dividend.
 * @param b - The divisor.
 */
export function umod(a: bigint, b: bigint): bigint {
  const result = a % b;
  return result >= _0n ? result : b + result;
}

/**
 * Verifies the Schnorr signature for a given message using the provided public key and signature.
 * @param message - The message to be verified.
 * @param proof - The proof to be verified.
 * @param publicKey - The public key corresponding to the private key used to generate the signature.
 * @returns A boolean indicating whether the signature is valid or not.
 * @throws FleetError if the public key is invalid.
 */
export function verify(message: Uint8Array, proof: Uint8Array, publicKey: Uint8Array) {
  if (!proof || proof.length !== ERGO_SCHNORR_SIG_LEN) return false;
  if (!validateEcPoint(publicKey)) throw new FleetError("Invalid Public Key.");

  const c = bigintBE.encode(proof.slice(0, ERGO_SOUNDNESS_BYTES));
  const z = bigintBE.encode(proof.slice(ERGO_SOUNDNESS_BYTES, ERGO_SCHNORR_SIG_LEN));

  const t = Point.fromBytes(publicKey).multiply(N - c);
  const w = G.multiply(z).add(t).toBytes();
  const c2 = fiatShamirHash(genCommitment(publicKey, w, message));

  return c2 === c;
}

/**
 * Computes the numeric Fiat-Shamir hash of a given message.
 */
function fiatShamirHash(message: Uint8Array) {
  return bigintBE.encode(blake2b256(message).slice(0, ERGO_SOUNDNESS_BYTES));
}

const COMMITMENT_PREFIX = hex.decode("010027100108cd");
const COMMITMENT_POSTFIX = hex.decode("73000021");

/**
 * Generates a commitment for the given public key, w, and message.
 */
function genCommitment(pk: Uint8Array, w: Uint8Array, message: Uint8Array) {
  return concatBytes(COMMITMENT_PREFIX, pk, COMMITMENT_POSTFIX, w, message);
}
