import { AddressType, Base58String, HexString, Network } from "@fleet-sdk/common";
import { concatBytes, endsWith, first, startsWith } from "@fleet-sdk/common";
import {
  base58,
  blake2b256,
  BytesInput,
  ensureBytes,
  hex,
  validateEcPoint
} from "@fleet-sdk/crypto";
import { InvalidAddress } from "../errors/invalidAddress";
import {
  BLAKE_256_HASH_LENGTH,
  encodeAddress,
  getAddressType,
  getNetworkType,
  unpackAddress,
  UnpackedAddress,
  validateAddress,
  validateUnpackedAddress
} from "./utils";

const P2PK_ERGOTREE_PREFIX = hex.decode("0008cd");
const P2PK_ERGOTREE_LENGTH = 36;

const P2SH_ERGOTREE_SUFFIX = hex.decode("d40801");
const P2SH_ERGOTREE_PREFIX = hex.decode("00ea02d193b4cbe4e3010e040004300e18");
const P2SH_ERGOTREE_LENGTH = 44;
const P2SH_HASH_LENGTH = 24;

function getErgoTreeType(ergoTree: Uint8Array): AddressType {
  if (ergoTree.length === P2PK_ERGOTREE_LENGTH && startsWith(ergoTree, P2PK_ERGOTREE_PREFIX)) {
    return AddressType.P2PK;
  } else if (
    ergoTree.length === P2SH_ERGOTREE_LENGTH &&
    startsWith(ergoTree, P2SH_ERGOTREE_PREFIX) &&
    endsWith(ergoTree, P2SH_ERGOTREE_SUFFIX)
  ) {
    return AddressType.P2SH;
  } else {
    return AddressType.P2S;
  }
}

/**
 * Ergo address model
 *
 * @example
 * Convert address to ErgoTree hex string
 * ```
 * const address = new Address("9eZ24iqjKywjzAti9RnWWTR3CiNnLJDAcd2MenKodcAfzc8AFTu");
 * console.log(address.ergoTree);
 * ```
 *
 * @example
 * Convert ErgoTree hex string to address string
 * ```
 * const ergoTree = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7"
 * const address = Address.fromErgoTree(ergoTree).toString();
 * ```
 */
export class ErgoAddress {
  #ergoTree: Uint8Array;
  #network: Network;
  #type: AddressType;

  public get network(): Network {
    return this.#network;
  }

  /**
   * ErgoTree hex string
   */
  public get ergoTree(): HexString {
    return hex.encode(this.#ergoTree);
  }

  public get type(): AddressType {
    return this.#type;
  }

  /**
   * New instance from ErgoTree bytes
   * @param ergoTree ErgoTree bytes
   */
  public constructor(ergoTree: Uint8Array, network: Network = Network.Mainnet) {
    this.#ergoTree = ergoTree;
    this.#network = network;
    this.#type = getErgoTreeType(ergoTree);
  }

  /**
   * Create a new instance from an ErgoTree
   * @param ergoTree ErgoTree hex string
   */
  public static fromErgoTree(ergoTree: BytesInput, network?: Network): ErgoAddress {
    return new ErgoAddress(ensureBytes(ergoTree), network);
  }

  /**
   * Create a new instance from a public key
   * @param publicKey Public key hex string
   */
  public static fromPublicKey(publicKey: BytesInput, network?: Network): ErgoAddress {
    const bytes = ensureBytes(publicKey);
    if (!validateEcPoint(bytes)) throw new Error("The Public Key is invalid.");

    const ergoTree = concatBytes(P2PK_ERGOTREE_PREFIX, bytes);
    return new ErgoAddress(ergoTree, network);
  }

  public static fromHash(hash: HexString | Uint8Array, network?: Network): ErgoAddress {
    hash = ensureBytes(hash);

    if (hash.length === BLAKE_256_HASH_LENGTH) {
      hash = hash.subarray(0, P2SH_HASH_LENGTH);
    } else if (hash.length != P2SH_HASH_LENGTH) {
      throw Error(`Invalid hash length: ${hash.length}`);
    }

    const ergoTree = concatBytes(P2SH_ERGOTREE_PREFIX, hash, P2SH_ERGOTREE_SUFFIX);

    return new ErgoAddress(ergoTree, network);
  }

  /**
   * Create a new checked instance from an address string
   * @param encodedAddress Address encoded as base58
   */
  public static decode(encodedAddress: Base58String): ErgoAddress {
    const bytes = base58.decode(encodedAddress);
    const unpacked = unpackAddress(bytes);
    if (!validateUnpackedAddress(unpacked)) throw new InvalidAddress(encodedAddress);

    return this.#fromUnpacked(unpacked);
  }

  public static decodeUnsafe(encodedAddress: Base58String): ErgoAddress {
    return this.#fromUnpacked(unpackAddress(base58.decode(encodedAddress)));
  }

  static fromBase58(address: Base58String, unsafe = false): ErgoAddress {
    return unsafe ? this.decodeUnsafe(address) : this.decode(address);
  }

  static #fromUnpacked(unpacked: UnpackedAddress) {
    switch (unpacked.type) {
      case AddressType.P2PK:
        return ErgoAddress.fromPublicKey(unpacked.body, unpacked.network);
      case AddressType.P2SH:
        return ErgoAddress.fromHash(unpacked.body, unpacked.network);
      case AddressType.ADH:
        throw new Error("Invalid address type");
      default:
        return new ErgoAddress(unpacked.body, unpacked.network);
    }
  }

  /**
   * Validate an address
   * @param address Address bytes or string
   * @deprecated Use `validateAddress()` function instead
   */
  public static validate(address: Base58String): boolean {
    return validateAddress(address);
  }

  public static getNetworkType(address: Base58String): Network {
    return getNetworkType(base58.decode(address));
  }

  public static getAddressType(address: Base58String): AddressType {
    return getAddressType(base58.decode(address));
  }

  public getPublicKeys(): Uint8Array[] {
    if (this.type === AddressType.P2PK) {
      return [this.#ergoTree.subarray(P2PK_ERGOTREE_PREFIX.length)];
    }

    return [];
  }

  public toP2SH(network?: Network): Base58String {
    if (this.type === AddressType.P2SH) return this.encode();

    const hash = blake2b256(this.#ergoTree).subarray(0, P2SH_HASH_LENGTH);
    return encodeAddress(hash, AddressType.P2SH, network ?? this.#network);
  }

  /**
   * Encode address as base58 string
   */
  public encode(network?: Network): Base58String {
    let body: Uint8Array;
    if (this.type === AddressType.P2PK) {
      body = first(this.getPublicKeys());
    } else if (this.type === AddressType.P2SH) {
      body = this.#ergoTree.subarray(
        P2SH_ERGOTREE_PREFIX.length,
        P2SH_ERGOTREE_PREFIX.length + P2SH_HASH_LENGTH
      );
    } else {
      body = this.#ergoTree;
    }

    return encodeAddress(body, this.#type, network ?? this.#network);
  }

  /**
   * Encode address as base58 string
   */
  public toString(network?: Network): Base58String {
    return this.encode(network ?? this.#network);
  }
}
