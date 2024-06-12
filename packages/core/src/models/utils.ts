import { AddressType, first, Network } from "@fleet-sdk/common";

export const CHECKSUM_LENGTH = 4;
export const BLAKE_256_HASH_LENGTH = 32;

export type UnpackedAddress = {
  network: Network;
  type: AddressType;
  body: Uint8Array;
  checksum: Uint8Array;
};

export function getNetworkType(addressBytes: Uint8Array): Network {
  return first(addressBytes) & 0xf0;
}

export function getAddressType(addressBytes: Uint8Array): AddressType {
  return first(addressBytes) & 0xf;
}

export function unpackAddress(bytes: Uint8Array): UnpackedAddress {
  const type = getAddressType(bytes);
  const network = getNetworkType(bytes);
  const body = bytes.subarray(0, bytes.length - CHECKSUM_LENGTH);
  const checksum = bytes.subarray(bytes.length - CHECKSUM_LENGTH, bytes.length);

  return { network, type, body, checksum };
}
