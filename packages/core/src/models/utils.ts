import {
  AddressType,
  areEqual,
  Base58String,
  concatBytes,
  first,
  isEmpty,
  Network
} from "@fleet-sdk/common";
import { base58, blake2b256, BytesInput, hex, validateEcPoint } from "@fleet-sdk/crypto";

export const CHECKSUM_LENGTH = 4;
export const BLAKE_256_HASH_LENGTH = 32;

export type UnpackedAddress = {
  head: Uint8Array;
  body: Uint8Array;
  checksum: Uint8Array;
  network: Network;
  type: AddressType;
};

export function ensureBytes(input: BytesInput): Uint8Array {
  return typeof input === "string" ? hex.decode(input) : input;
}

export function getNetworkType(addressBytes: Uint8Array): Network {
  return first(addressBytes) & 0xf0;
}

export function getAddressType(addressBytes: Uint8Array): AddressType {
  return first(addressBytes) & 0x0f;
}

/**
 * Unpacks the given bytes into an UnpackedAddress object.
 *
 * @param bytes - The bytes to unpack.
 * @returns The UnpackedAddress object containing the unpacked data.
 */
export function unpackAddress(bytes: Uint8Array): UnpackedAddress {
  return {
    head: bytes.subarray(0, 1),
    body: bytes.subarray(1, bytes.length - CHECKSUM_LENGTH),
    checksum: bytes.subarray(bytes.length - CHECKSUM_LENGTH, bytes.length),
    network: getNetworkType(bytes),
    type: getAddressType(bytes)
  };
}

export function encodeAddress(body: Uint8Array, type: AddressType, network: Network): Base58String {
  const head = Uint8Array.from([network + type]);
  const headAndBody = concatBytes(head, body);
  const checksum = blake2b256(headAndBody).subarray(0, CHECKSUM_LENGTH);
  return base58.encode(concatBytes(head, body, checksum));
}

export function validateUnpackedAddress(unpacked: UnpackedAddress): boolean {
  const content = concatBytes(unpacked.head, unpacked.body);
  if (isEmpty(unpacked.body)) return false;
  if (unpacked.type === AddressType.P2PK && !validateEcPoint(unpacked.body)) return false;

  const checksum = blake2b256(content).subarray(0, CHECKSUM_LENGTH);
  return areEqual(checksum, unpacked.checksum);
}

/**
 * Validates a Base58 encoded address.
 *
 * @param encodedAddress - The Base58 encoded address to validate.
 * @returns A boolean indicating whether the address is valid or not.
 */
export function validateAddress(encodedAddress: Base58String): boolean {
  return validateUnpackedAddress(unpackAddress(base58.decode(encodedAddress)));
}
