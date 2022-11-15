import { blake2b } from "@noble/hashes/blake2b";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils";
import { base58 } from "@scure/base";
import { InvalidAddress } from "../errors/invalidAddress";
import { AddressType, Base58String, HexString, Network } from "../types";
import { areEqual, first } from "../utils/arrayUtils";

const CHECKSUM_BYTES_LENGTH = 4;
const BLAKE_HASH_LENGTH = 32;
const P2PK_ERGOTREE_PREFIX_BYTES = Uint8Array.from([0x00, 0x08, 0xcd]);
const P2PK_ERGOTREE_PREFIX_HEX = bytesToHex(P2PK_ERGOTREE_PREFIX_BYTES);

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
  public readonly bytes: Uint8Array;
  private readonly _address: string;

  private get _headByte() {
    return first(this.bytes);
  }

  /**
   * Public key for P2PK address
   */
  public get publicKey(): Uint8Array {
    return this.type === AddressType.P2PK ? this.bytes.subarray(1, 34) : Uint8Array.from([]);
  }

  /**
   * ErgoTree hex string
   */
  public get ergoTree(): HexString {
    if (this.type === AddressType.P2PK) {
      return bytesToHex(concatBytes(P2PK_ERGOTREE_PREFIX_BYTES, this.publicKey));
    } else {
      return bytesToHex(this.bytes.subarray(1, this.bytes.length - CHECKSUM_BYTES_LENGTH));
    }
  }

  /**
   * Address network type
   */
  public get network(): Network {
    return this._headByte & 0xf0;
  }

  /**
   * Address type
   */
  public get type(): AddressType {
    return this._headByte & 0xf;
  }

  /**
   * New instance from bytes
   * @param bytes Address bytes
   */
  constructor(bytes: Uint8Array);
  /**
   * New instance from base58 encoded address string
   * @param address Address string
   */
  constructor(address: Base58String);
  constructor(address: Base58String | Uint8Array) {
    if (typeof address === "string") {
      this._address = address;
      this.bytes = base58.decode(this._address);
    } else {
      this._address = base58.encode(address);
      this.bytes = address;
    }
  }

  /**
   * Create a new checked instance from an address string
   * @param address Address encoded as base58
   */
  public static fromBase58(address: Base58String): ErgoAddress {
    return ErgoAddress.fromBytes(base58.decode(address));
  }

  /**
   * Create a new checked instance from bytes
   * @param bytes Address bytes
   */
  public static fromBytes(bytes: Uint8Array): ErgoAddress {
    const address = new ErgoAddress(bytes);
    if (!address.isValid()) {
      throw new InvalidAddress(address._address);
    }

    return address;
  }

  /**
   * Create a new instance from an ErgoTree
   * @param ergoTree ErgoTree hex string
   */
  public static fromErgoTree(ergoTree: HexString, network: Network = Network.Mainnet): ErgoAddress {
    return ergoTree.startsWith(P2PK_ERGOTREE_PREFIX_HEX)
      ? ErgoAddress._fromP2PKErgoTree(ergoTree, network)
      : ErgoAddress._fromP2SErgoTree(ergoTree, network);
  }

  private static _fromP2SErgoTree(ergoTree: HexString, network: Network) {
    const prefixByte = Uint8Array.from([network + AddressType.P2S]);
    const contentBytes = hexToBytes(ergoTree);
    const hash = blake2b(concatBytes(prefixByte, contentBytes), { dkLen: BLAKE_HASH_LENGTH });
    const checksum = hash.subarray(0, CHECKSUM_BYTES_LENGTH);
    const addressBytes = concatBytes(prefixByte, contentBytes, checksum);

    return new ErgoAddress(addressBytes);
  }

  private static _fromP2PKErgoTree(ergoTree: HexString, network: Network) {
    const prefixByte = Uint8Array.from([network + AddressType.P2PK]);
    const pk = ergoTree.slice(6, 72);
    const contentBytes = hexToBytes(pk);
    const checksum = blake2b(concatBytes(prefixByte, contentBytes), { dkLen: BLAKE_HASH_LENGTH });
    const addressBytes = concatBytes(prefixByte, contentBytes, checksum).subarray(0, 38);

    return new ErgoAddress(addressBytes);
  }

  /**
   * Create a new instance from a public key
   * @param publicKey Public key hex string
   */
  public static fromPublicKey(
    publicKey: HexString | Uint8Array,
    network: Network = Network.Mainnet
  ): ErgoAddress {
    const prefixByte = Uint8Array.from([network + AddressType.P2PK]);
    const contentBytes = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey;
    const checksum = blake2b(concatBytes(prefixByte, contentBytes), {
      dkLen: BLAKE_HASH_LENGTH
    });
    const addressBytes = concatBytes(prefixByte, contentBytes, checksum).subarray(0, 38);

    return new ErgoAddress(addressBytes);
  }

  /**
   * Validate an address
   * @param address Address buffer or string
   */
  public static validate(address: Uint8Array | HexString): boolean {
    const bytes = typeof address === "string" ? base58.decode(address) : address;
    if (bytes.length < CHECKSUM_BYTES_LENGTH) {
      return false;
    }

    const script = bytes.subarray(0, bytes.length - CHECKSUM_BYTES_LENGTH);
    const checksum = bytes.subarray(bytes.length - CHECKSUM_BYTES_LENGTH, bytes.length);
    const blakeHash = blake2b(script, { dkLen: BLAKE_HASH_LENGTH });
    const calculatedChecksum = blakeHash.subarray(0, CHECKSUM_BYTES_LENGTH);

    return areEqual(calculatedChecksum, checksum);
  }

  /**
   * Check address validity
   */
  public isValid(): boolean {
    return ErgoAddress.validate(this.bytes);
  }

  /**
   * Encode address as base58 string
   */
  public toString(): string {
    return this._address;
  }
}
