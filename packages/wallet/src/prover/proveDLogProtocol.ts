import { _0n, concatBytes } from "@fleet-sdk/common";
import type { Coder } from "@fleet-sdk/crypto";
import { blake2b256, hex, randomBytes } from "@fleet-sdk/crypto";
import { secp256k1 } from "@noble/curves/secp256k1";

const { ProjectivePoint: ECPoint, CURVE } = secp256k1;
const G = ECPoint.BASE;

const BLAKE2B_256_DIGEST_LEN = 32;
const ERGO_SOUNDNESS_BYTES = 24;
const ERGO_SCHNORR_SIG_LEN = BLAKE2B_256_DIGEST_LEN + ERGO_SOUNDNESS_BYTES;
const MAX_ITERATIONS = 100;

/**
 * A coder for Big Endian  `BigInt` <> `Uint8Array` conversion..
 */
const bigint: Coder<Uint8Array, bigint> = {
  /**
   * Encode a `Uint8Array` to a `BigInt`.
   */
  encode(data) {
    const hexInput = hex.encode(data);
    return BigInt(hexInput == "" ? "0" : "0x" + hexInput);
  },

  /**
   * Decode a `BigInt` to a `Uint8Array`.
   */
  decode(data) {
    const hexData = data.toString(16);
    return hex.decode(hexData.length % 2 ? "0" + hexData : hexData);
  }
};

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
 * @returns The generated signature as a Uint8Array, or undefined if the verification fails.
 * @throws Error if failed to generate commitment.
 */
export function genSignature(message: Uint8Array, secretKey: Uint8Array): undefined | Uint8Array {
  const sk = bigint.encode(secretKey);
  const y = genY();
  const w = G.multiply(y).toRawBytes();
  const pk = G.multiply(sk).toRawBytes();
  const s = genCommitment(pk, w, message);
  const c = fiatShamirHash(s);
  if (c === 0n) throw new Error("Failed to generate challenge");
  const z = umod(sk * c + y, CURVE.n);

  const cb = bigint.decode(c);
  const zb = bigint.decode(z);
  const signature = concatBytes(cb, zb);

  if (!verify(message, signature, pk)) return;
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
    y = umod(bigint.encode(randomBytes(32)), CURVE.n);
    c++;
  }

  if (y === 0n) throw new Error("Failed to generate y");
  return y;
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
 */
export function verify(message: Uint8Array, proof: Uint8Array, publicKey: Uint8Array) {
  if (proof.length !== ERGO_SCHNORR_SIG_LEN) return false;

  const c = bigint.encode(proof.slice(0, ERGO_SOUNDNESS_BYTES));
  const z = bigint.encode(proof.slice(ERGO_SOUNDNESS_BYTES, ERGO_SCHNORR_SIG_LEN));

  const t = ECPoint.fromHex(publicKey).multiply(CURVE.n - c);
  const w = G.multiply(z).add(t).toRawBytes();
  const s = genCommitment(publicKey, w, message);

  return fiatShamirHash(s) === c;
}

/**
 * Computes the numeric Fiat-Shamir hash of a given message.
 */
function fiatShamirHash(message: Uint8Array) {
  return bigint.encode(blake2b256(message).slice(0, ERGO_SOUNDNESS_BYTES));
}

const COMMITMENT_PREFIX = hex.decode("010027100108cd");
const COMMITMENT_POSTFIX = hex.decode("73000021");

/**
 * Generates a commitment for the given public key, w, and message.
 */
function genCommitment(pk: Uint8Array, w: Uint8Array, message: Uint8Array) {
  return concatBytes(COMMITMENT_PREFIX, pk, COMMITMENT_POSTFIX, w, message);
}
