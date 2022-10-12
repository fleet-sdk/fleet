import { blake2b } from "@noble/hashes/blake2b";
import { base58 } from "@scure/base";
import { InvalidAddress } from "../errors/invalidAddress";
import { AddressType, Base58String, HexString, Network } from "../types";
import { first } from "../utils/arrayUtils";

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
export class ErgoAddress {
  public readonly bytes: Buffer;
  private readonly _address: string;

  private get _headByte() {
    return first(this.bytes);
  }

  /**
   * Public key for P2PK address
   */
  public get publicKey(): Buffer {
    return this.type === AddressType.P2PK ? this.bytes.subarray(1, 34) : Buffer.from([]);
  }

  /**
   * ErgoTree hex string
   */
  public get ergoTree(): HexString {
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
   * New instance from base58 encoded address string
   * @param address Address string
   */
  constructor(address: Base58String);
  constructor(address: Base58String | Buffer) {
    if (Buffer.isBuffer(address)) {
      this._address = base58.encode(address);
      this.bytes = address;
    } else {
      this._address = address;
      this.bytes = Buffer.from(base58.decode(this._address));
    }
  }

  /**
   * Create a new checked instance from an address string
   * @param address Address encoded as base58
   */
  public static fromBase58(address: Base58String): ErgoAddress {
    return ErgoAddress.fromBytes(Buffer.from(base58.decode(address)));
  }

  /**
   * Create a new checked instance from bytes
   * @param bytes Address bytes
   */
  public static fromBytes(bytes: Buffer): ErgoAddress {
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
    const prefixByte = Buffer.from([network + AddressType.P2S]);
    const contentBytes = Buffer.from(ergoTree, "hex");
    const hash = blake2b(Buffer.concat([prefixByte, contentBytes]), { dkLen: BLAKE_HASH_LENGTH });
    const checksum = Buffer.from(hash).subarray(0, CHECKSUM_BYTES_LENGTH);
    const addressBytes = Buffer.concat([prefixByte, contentBytes, checksum]);

    return new ErgoAddress(addressBytes);
  }

  private static _fromP2PKErgoTree(ergoTree: HexString, network: Network) {
    const prefixByte = Buffer.from([network + AddressType.P2PK]);
    const pk = ergoTree.slice(6, 72);
    const contentBytes = Buffer.from(pk, "hex");
    const checksum = Buffer.from(
      blake2b(Buffer.concat([prefixByte, contentBytes]), { dkLen: BLAKE_HASH_LENGTH })
    );
    const addressBytes = Buffer.concat([prefixByte, contentBytes, checksum]).subarray(0, 38);

    return new ErgoAddress(addressBytes);
  }

  /**
   * Create a new instance from a public key
   * @param publicKey Public key hex string
   */
  public static fromPublicKey(
    publicKey: HexString | Buffer,
    network: Network = Network.Mainnet
  ): ErgoAddress {
    const prefixByte = Buffer.from([network + AddressType.P2PK]);
    const contentBytes = typeof publicKey === "string" ? Buffer.from(publicKey, "hex") : publicKey;
    const checksum = Buffer.from(
      blake2b(Buffer.concat([prefixByte, contentBytes]), { dkLen: BLAKE_HASH_LENGTH })
    );
    const addressBytes = Buffer.concat([prefixByte, contentBytes, checksum]).subarray(0, 38);

    return new ErgoAddress(addressBytes);
  }

  /**
   * Validate an address
   * @param address Address buffer or string
   */
  public static validate(address: Buffer | HexString): boolean {
    const bytes = Buffer.isBuffer(address) ? address : Buffer.from(base58.decode(address));
    if (bytes.length < CHECKSUM_BYTES_LENGTH) {
      return false;
    }

    const script = bytes.subarray(0, bytes.length - CHECKSUM_BYTES_LENGTH);
    const checksum = bytes.subarray(bytes.length - CHECKSUM_BYTES_LENGTH, bytes.length);
    const blakeHash = Buffer.from(blake2b(script, { dkLen: BLAKE_HASH_LENGTH }));
    const calculatedChecksum = blakeHash.subarray(0, CHECKSUM_BYTES_LENGTH);

    return calculatedChecksum.toString("hex") === checksum.toString("hex");
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
