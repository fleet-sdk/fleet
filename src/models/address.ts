import { getPublicKey as getSecpPublicKey } from "@noble/secp256k1";
import { blake2b } from "blakejs";
import * as bs58 from "bs58";
import { InvalidAddressError } from "../builder/errors/invalidAddressError";
import { AddressType, Network } from "../types";
import { first } from "../utils/arrayUtils";

const KEY_BYTES_LENGTH = 32;
const KEY_HEX_LENGTH = KEY_BYTES_LENGTH * 2;
const CHECKSUM_BYTES_LENGTH = 4;
const BLAKE_HASH_LENGTH = 32;
const P2PK_ERGOTREE_PREFIX_BYTES = Buffer.from([0x00, 0x08, 0xcd]);
const P2PK_ERGOTREE_PREFIX_HEX = P2PK_ERGOTREE_PREFIX_BYTES.toString("hex");

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
export class Address {
  public readonly bytes: Buffer;
  private readonly _address: string;

  private get _headByte() {
    return first(this.bytes);
  }

  /**
   * Public key
   */
  public get publicKey(): Buffer {
    return this.bytes.subarray(1, 34);
  }

  /**
   * ErgoTree hex string
   */
  public get ergoTree(): string {
    if (this.type === AddressType.P2PK) {
      return Buffer.concat([P2PK_ERGOTREE_PREFIX_BYTES, this.publicKey]).toString("hex");
    } else {
      return this.bytes.subarray(1, this.bytes.length - CHECKSUM_BYTES_LENGTH).toString("hex");
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
  constructor(bytes: Buffer);
  /**
   * New instance from base58 address string
   * @param address Address string
   */
  constructor(address: string);
  constructor(address: string | Buffer) {
    if (Buffer.isBuffer(address)) {
      this._address = bs58.encode(address);
      this.bytes = address;
    } else {
      this._address = address;
      this.bytes = Buffer.from(bs58.decode(this._address));
    }
  }

  /**
   * Create a new checked instance from an address string
   * @param address Address encoded as base58
   */
  public static fromBase58(address: string): Address {
    return Address.fromBytes(Buffer.from(bs58.decode(address)));
  }

  /**
   * Create a new checked instance from bytes
   * @param bytes Address bytes
   */
  public static fromBytes(bytes: Buffer): Address {
    const address = new Address(bytes);
    if (!address.isValid()) {
      throw new InvalidAddressError(address._address);
    }

    return address;
  }

  /**
   * Create a new instance from an ErgoTree
   * @param ergoTree ErgoTree hex string
   */
  public static fromErgoTree(ergoTree: string, network: Network = Network.Mainnet): Address {
    return ergoTree.startsWith(P2PK_ERGOTREE_PREFIX_HEX)
      ? Address._fromP2PKErgoTree(ergoTree, network)
      : Address._fromP2SErgoTree(ergoTree, network);
  }

  private static _fromP2SErgoTree(ergoTree: string, network: Network) {
    const prefixByte = Buffer.from([network + AddressType.P2S]);
    const contentBytes = Buffer.from(ergoTree, "hex");
    const hash = blake2b(Buffer.concat([prefixByte, contentBytes]), undefined, BLAKE_HASH_LENGTH);
    const checksum = Buffer.from(hash).subarray(0, CHECKSUM_BYTES_LENGTH);
    const addressBytes = Buffer.concat([prefixByte, contentBytes, checksum]);

    return new Address(addressBytes);
  }

  private static _fromP2PKErgoTree(ergoTree: string, network: Network) {
    const prefixByte = Buffer.from([network + AddressType.P2PK]);
    const pk = ergoTree.slice(6, 72);
    const contentBytes = Buffer.from(pk, "hex");
    const checksum = Buffer.from(
      blake2b(Buffer.concat([prefixByte, contentBytes]), undefined, BLAKE_HASH_LENGTH)
    );
    const addressBytes = Buffer.concat([prefixByte, contentBytes, checksum]).subarray(0, 38);

    return new Address(addressBytes);
  }

  /**
   * Create a new instance from a public key
   * @param publicKey Public key hex string
   */
  public static fromPublicKey(
    publicKey: string | Buffer,
    network: Network = Network.Mainnet
  ): Address {
    const prefixByte = Buffer.from([network + AddressType.P2PK]);
    const contentBytes = Buffer.from(publicKey);
    const checksum = Buffer.from(
      blake2b(Buffer.concat([prefixByte, contentBytes]), undefined, BLAKE_HASH_LENGTH)
    );
    const addressBytes = Buffer.concat([prefixByte, contentBytes, checksum]).subarray(0, 38);

    return new Address(addressBytes);
  }

  /**
   * Create a new instance from a secret key
   * @param secretKey Secret key hex string
   * @returns Address instance
   */
  public static fromSecretKey(secretKey: string, network: Network = Network.Mainnet): Address {
    if (secretKey.length < KEY_HEX_LENGTH) {
      secretKey = secretKey.padStart(KEY_HEX_LENGTH, "0");
    }

    return this.fromPublicKey(Buffer.from(getSecpPublicKey(secretKey, true)), network);
  }

  /**
   * Validate an address
   * @param address Address buffer or string
   */
  public static validate(address: Buffer | string): boolean {
    const bytes = Buffer.isBuffer(address) ? address : Buffer.from(bs58.decode(address));
    if (bytes.length < CHECKSUM_BYTES_LENGTH) {
      return false;
    }

    const length = bytes.length;
    const script = bytes.subarray(0, length - CHECKSUM_BYTES_LENGTH);
    const checksum = bytes.subarray(length - CHECKSUM_BYTES_LENGTH, length);
    const blakeHash = Buffer.from(blake2b(script, undefined, BLAKE_HASH_LENGTH));
    const calculatedChecksum = blakeHash.subarray(0, CHECKSUM_BYTES_LENGTH);

    return calculatedChecksum.toString("hex") === checksum.toString("hex");
  }

  /**
   * Check address validity
   */
  public isValid(): boolean {
    return Address.validate(this.bytes);
  }

  /**
   * Encode address as base58 string
   */
  public toString(): string {
    return this._address;
  }
}
