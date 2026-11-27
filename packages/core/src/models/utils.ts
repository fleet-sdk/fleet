import {
  AddressType,
  type Base58String,
  Network,
  areEqual,
  concatBytes,
  first,
  isEmpty
} from "@fleet-sdk/common";
import { base58, blake2b256, validateEcPoint } from "@fleet-sdk/crypto";
import { SigmaByteWriter } from "@fleet-sdk/serializer";

export const CHECKSUM_LENGTH = 4;
export const BLAKE_256_HASH_LENGTH = 32;
export const P2SH_HASH_LENGTH = 24;

export type UnpackedAddress = {
  head: Uint8Array;
  body: Uint8Array;
  checksum: Uint8Array;
  network: Network;
  type: AddressType;
};

export function getNetworkType(addressBytes: Uint8Array): Network {
  return first(addressBytes) & 0xf0;
}

export function getAddressType(addressBytes: Uint8Array): AddressType {
  return first(addressBytes) & 0x0f;
}

export function isValidNetwork(network: Network): boolean {
  return network === Network.Mainnet || network === Network.Testnet;
}

export function hasValidChecksum(unpacked: UnpackedAddress): boolean {
  const content = concatBytes(unpacked.head, unpacked.body);
  const checksum = blake2b256(content).subarray(0, CHECKSUM_LENGTH);
  return areEqual(checksum, unpacked.checksum);
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

export function encodeAddress(
  network: Network,
  type: AddressType,
  content: Uint8Array
): Base58String {
  return new SigmaByteWriter(1 /** head */ + content.length + CHECKSUM_LENGTH)
    .write(network + type)
    .writeBytes(content)
    .writeChecksum(CHECKSUM_LENGTH)
    .encode(base58);
}

export function validateUnpackedAddress(unpacked: UnpackedAddress): boolean {
  if (!isValidNetwork(unpacked.network) || isEmpty(unpacked.body)) return false;

  switch (unpacked.type) {
    case AddressType.P2PK:
      if (!validateEcPoint(unpacked.body)) return false;
      break;
    case AddressType.P2SH:
      if (unpacked.body.length !== P2SH_HASH_LENGTH) return false;
      break;
    case AddressType.P2S:
      break;
    default:
      return false;
  }

  return hasValidChecksum(unpacked);
}

/**
 * Validates a Base58 encoded address.
 *
 * @param encodedAddress - The Base58 encoded address to validate.
 * @returns A boolean indicating whether the address is valid or not.
 */
export function validateAddress(encodedAddress: Base58String): boolean {
  if (!encodedAddress) return false;

  let bytes: Uint8Array;
  try {
    bytes = base58.decode(encodedAddress);
  } catch {
    return false;
  }

  if (bytes.length <= CHECKSUM_LENGTH + 1) return false;
  return validateUnpackedAddress(unpackAddress(bytes));
}
