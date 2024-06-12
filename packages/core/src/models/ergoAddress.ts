import { AddressType, Base58String, HexString, Network } from "@fleet-sdk/common";
import { areEqual, concatBytes, endsWith, first, isDefined, startsWith } from "@fleet-sdk/common";
import { base58, blake2b256, hex, validateEcPoint } from "@fleet-sdk/crypto";
import { InvalidAddress } from "../errors/invalidAddress";
import {
  BLAKE_256_HASH_LENGTH,
  CHECKSUM_LENGTH,
  getAddressType,
  getNetworkType,
  unpackAddress
} from "./utils";

const P2PK_ERGOTREE_PREFIX = hex.decode("0008cd");
const P2PK_ERGOTREE_LENGTH = 36;

const P2SH_ERGOTREE_SUFFIX = hex.decode("d40801");
const P2SH_ERGOTREE_PREFIX = hex.decode("00ea02d193b4cbe4e3010e040004300e18");
const P2SH_ERGOTREE_LENGTH = 44;
const P2SH_HASH_LENGTH = 24;

function _ensureBytes(content: HexString | Uint8Array): Uint8Array {
  if (typeof content === "string") {
    return hex.decode(content);
  }

  return content;
}

function _getErgoTreeType(ergoTree: Uint8Array): AddressType {
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
  private _ergoTree: Uint8Array;
  private _network?: Network;
  private _type: AddressType;

  public get network(): Network | undefined {
    return this._network;
  }

  /**
   * ErgoTree hex string
   */
  public get ergoTree(): HexString {
    return hex.encode(this._ergoTree);
  }

  public get type(): AddressType {
    return this._type;
  }

  /**
   * New instance from ErgoTree bytes
   * @param ergoTree ErgoTree bytes
   */
  public constructor(ergoTree: Uint8Array, network?: Network) {
    this._ergoTree = ergoTree;
    this._network = network;
    this._type = _getErgoTreeType(ergoTree);
  }

  /**
   * Create a new instance from an ErgoTree
   * @param ergoTree ErgoTree hex string
   */
  public static fromErgoTree(ergoTree: HexString, network?: Network): ErgoAddress {
    return new ErgoAddress(hex.decode(ergoTree), network);
  }

  /**
   * Create a new instance from a public key
   * @param publicKey Public key hex string
   */
  public static fromPublicKey(publicKey: HexString | Uint8Array, network?: Network): ErgoAddress {
    const bytes = _ensureBytes(publicKey);
    if (!validateEcPoint(bytes)) {
      throw new Error("The Public Key is invalid.");
    }

    const ergoTree = concatBytes(P2PK_ERGOTREE_PREFIX, bytes);

    return new ErgoAddress(ergoTree, network);
  }

  public static fromHash(hash: HexString | Uint8Array, network?: Network): ErgoAddress {
    hash = _ensureBytes(hash);

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
  public static fromBase58(encodedAddress: Base58String, skipCheck = false): ErgoAddress {
    const bytes = base58.decode(encodedAddress);
    if (!skipCheck && !ErgoAddress.validate(bytes)) throw new InvalidAddress(encodedAddress);

    const { network, type, body } = unpackAddress(bytes);
    const script = body.subarray(1);

    if (type === AddressType.ADH) {
      throw new InvalidAddress(encodedAddress);
    } else if (type === AddressType.P2PK) {
      return this.fromPublicKey(script, network);
    } else if (type === AddressType.P2SH) {
      return this.fromHash(script, network);
    } else {
      return new ErgoAddress(script, network);
    }
  }

  /**
   * Validate an address
   * @param address Address bytes or string
   */
  public static validate(address: Uint8Array | Base58String): boolean {
    const byte = typeof address === "string" ? base58.decode(address) : address;
    if (byte.length < CHECKSUM_LENGTH) return false;

    const unpacked = unpackAddress(byte);
    if (unpacked.type === AddressType.ADH) return false;
    if (unpacked.type === AddressType.P2PK && !validateEcPoint(unpacked.body.subarray(1))) {
      return false;
    }

    const checksum = blake2b256(unpacked.body).subarray(0, CHECKSUM_LENGTH);
    return areEqual(checksum, unpacked.checksum);
  }

  public static getNetworkType(address: Base58String): Network {
    return getNetworkType(base58.decode(address));
  }

  public static getAddressType(address: Base58String): AddressType {
    return getAddressType(base58.decode(address));
  }

  public getPublicKeys(): Uint8Array[] {
    if (this.type === AddressType.P2PK) {
      return [this._ergoTree.subarray(P2PK_ERGOTREE_PREFIX.length)];
    }

    return [];
  }

  public toP2SH(network?: Network): Base58String {
    if (this.type === AddressType.P2SH) {
      return this.encode();
    }

    const hash = blake2b256(this._ergoTree).subarray(0, P2SH_HASH_LENGTH);

    return this._encode(hash, AddressType.P2SH, network);
  }

  /**
   * Encode address as base58 string
   */
  public encode(network?: Network): Base58String {
    let body: Uint8Array;
    if (this.type === AddressType.P2PK) {
      body = first(this.getPublicKeys());
    } else if (this.type === AddressType.P2SH) {
      body = this._ergoTree.subarray(
        P2SH_ERGOTREE_PREFIX.length,
        P2SH_ERGOTREE_PREFIX.length + P2SH_HASH_LENGTH
      );
    } else {
      body = this._ergoTree;
    }

    return this._encode(body, this.type, network);
  }

  private _encode(body: Uint8Array, type: AddressType, network?: Network): Base58String {
    if (!isDefined(network)) {
      if (isDefined(this.network)) {
        network = this.network;
      } else {
        network = Network.Mainnet;
      }
    }

    const head = Uint8Array.from([network + type]);
    body = concatBytes(head, body);
    const checksum = blake2b256(body).subarray(0, CHECKSUM_LENGTH);

    return base58.encode(concatBytes(body, checksum));
  }

  /**
   * Encode address as base58 string
   */
  public toString(network?: Network): Base58String {
    return this.encode(network);
  }
}
