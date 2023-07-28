import { AddressType, Base58String, HexString, isEmpty, Network } from "@fleet-sdk/common";
import {
  areEqual,
  bytesToHex,
  concatBytes,
  endsWith,
  first,
  hexToBytes,
  isDefined,
  startsWith
} from "@fleet-sdk/common";
import { base58 } from "@scure/base";
import { InvalidAddress } from "../errors/invalidAddress";
import { blake2b256, BLAKE_256_HASH_LENGTH } from "../serializer/utils";

const CHECKSUM_LENGTH = 4;

const P2PK_ERGOTREE_PREFIX = hexToBytes("0008cd");
const P2PK_ERGOTREE_LENGTH = 36;

const P2SH_ERGOTREE_SUFFIX = hexToBytes("d40801");
const P2SH_ERGOTREE_PREFIX = hexToBytes("00ea02d193b4cbe4e3010e040004300e18");
const P2SH_ERGOTREE_LENGTH = 44;
const P2SH_HASH_LENGTH = 24;

function _getEncodedNetworkType(addressBytes: Uint8Array): Network {
  return first(addressBytes) & 0xf0;
}

function _getEncodedAddressType(addressBytes: Uint8Array): AddressType {
  return first(addressBytes) & 0xf;
}

function _ensureBytes(content: HexString | Uint8Array): Uint8Array {
  if (typeof content === "string") {
    return hexToBytes(content);
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
 * Validates a compressed Elliptic Curve point. Every non-infinity
 * compressed point must contain 33 bytes, and the first byte must
 * be equal to `0x02` or `0x03`, as described above:
 *
 * `0x02` = compressed, positive Y coordinate.
 * `0x03` = compressed, negative Y coordinate.
 *
 * @param pointBytes ECPoint bytes
 */
function _validateCompressedEcPoint(pointBytes: Uint8Array) {
  if (isEmpty(pointBytes) || pointBytes.length !== 33) {
    return false;
  }

  return pointBytes[0] === 0x02 || pointBytes[0] === 0x03;
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
    return bytesToHex(this._ergoTree);
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
    return new ErgoAddress(hexToBytes(ergoTree), network);
  }

  /**
   * Create a new instance from a public key
   * @param publicKey Public key hex string
   */
  public static fromPublicKey(publicKey: HexString | Uint8Array, network?: Network): ErgoAddress {
    const bytes = _ensureBytes(publicKey);
    if (!_validateCompressedEcPoint(bytes)) {
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
    if (!skipCheck && !ErgoAddress.validate(bytes)) {
      throw new InvalidAddress(encodedAddress);
    }

    const network = _getEncodedNetworkType(bytes);
    const type = _getEncodedAddressType(bytes);
    const body = bytes.subarray(1, bytes.length - CHECKSUM_LENGTH);

    if (type === AddressType.P2PK) {
      return this.fromPublicKey(body, network);
    } else if (type === AddressType.P2SH) {
      return this.fromHash(body, network);
    } else {
      return new ErgoAddress(body, network);
    }
  }

  /**
   * Validate an address
   * @param address Address bytes or string
   */
  public static validate(address: Uint8Array | Base58String): boolean {
    const bytes = typeof address === "string" ? base58.decode(address) : address;
    if (bytes.length < CHECKSUM_LENGTH) {
      return false;
    }

    if (_getEncodedAddressType(bytes) === AddressType.P2PK) {
      const pk = bytes.subarray(1, bytes.length - CHECKSUM_LENGTH);

      if (!_validateCompressedEcPoint(pk)) {
        return false;
      }
    }

    const script = bytes.subarray(0, bytes.length - CHECKSUM_LENGTH);
    const checksum = bytes.subarray(bytes.length - CHECKSUM_LENGTH, bytes.length);
    const blakeHash = blake2b256(script);
    const calculatedChecksum = blakeHash.subarray(0, CHECKSUM_LENGTH);

    return areEqual(calculatedChecksum, checksum);
  }

  public static getNetworkType(address: Base58String): Network {
    return _getEncodedNetworkType(base58.decode(address));
  }

  public static getAddressType(address: Base58String): AddressType {
    return _getEncodedAddressType(base58.decode(address));
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
