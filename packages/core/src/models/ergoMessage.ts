import {
  AddressType,
  areEqual,
  Base58String,
  concatBytes,
  isHex,
  Network
} from "@fleet-sdk/common";
import { base58, blake2b256, BytesInput, ensureBytes, hex, utf8 } from "@fleet-sdk/crypto";
import { JsonObject, JsonValue } from "type-fest";
import { CHECKSUM_LENGTH, unpackAddress, validateUnpackedAddress } from "./utils";

const ENCODED_HASH_LENGTH = 37; // head(1) + hash(32) + checksum(4)

export type NetworkOptions = {
  network?: Network;
};

export type ErgoMessageFromHashOptions = NetworkOptions & {
  hash: BytesInput;
};

export type MessageData = Uint8Array | JsonValue | JsonObject;

export type ErgoMessageFromDataOptions = NetworkOptions & {
  data: MessageData;
};

export type ErgoMessageOptions = ErgoMessageFromHashOptions | ErgoMessageFromDataOptions;

export const MessageType = {
  Hash: 0,
  Binary: 1,
  String: 2,
  Json: 3
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export class ErgoMessage {
  #data?: Uint8Array;
  #type: MessageType;
  #hash: Uint8Array;
  #network: Network;

  constructor(options: ErgoMessageOptions) {
    if ("data" in options) {
      [this.#data, this.#type] = this.#decodeData(options.data);
      this.#hash = blake2b256(this.#data);
    } else if ("hash" in options) {
      this.#hash = ensureBytes(options.hash);
      this.#type = MessageType.Hash;
    } else {
      throw new Error("Either hash or message data must be provided");
    }

    this.#network = options.network ?? Network.Mainnet;
  }

  get hash(): Uint8Array {
    return this.#hash;
  }

  get type(): MessageType {
    return this.#type;
  }

  #decodeData(data: MessageData): [Uint8Array, MessageType] {
    if (typeof data === "string") {
      return isHex(data)
        ? [hex.decode(data), MessageType.Hash]
        : [utf8.decode(data), MessageType.String];
    } else if (data instanceof Uint8Array) {
      return [data, MessageType.Binary];
    } else {
      return [utf8.decode(JSON.stringify(data)), MessageType.Json];
    }
  }

  static decode(encodedHash: Base58String): ErgoMessage {
    const bytes = base58.decode(encodedHash);
    if (bytes.length !== ENCODED_HASH_LENGTH) throw new Error("Invalid encoded message hash");

    const unpacked = unpackAddress(base58.decode(encodedHash));
    if (unpacked.type !== AddressType.ADH) throw new Error("Invalid message type");
    if (!validateUnpackedAddress(unpacked)) throw new Error("Invalid encoded message hash");

    return new ErgoMessage({ hash: unpacked.body, network: unpacked.network });
  }

  fromBase58(encodedHash: Base58String): ErgoMessage {
    return ErgoMessage.decode(encodedHash);
  }

  encode(network?: Network): string {
    const head = Uint8Array.from([(network ?? this.#network) + AddressType.ADH]);
    const body = concatBytes(head, this.hash);
    const checksum = blake2b256(body).subarray(0, CHECKSUM_LENGTH);
    return base58.encode(concatBytes(body, checksum));
  }

  toString(network?: Network): string {
    return this.encode(network);
  }

  setNetwork(network: Network): ErgoMessage {
    this.#network = network;
    return this;
  }

  getData<T extends MessageData = MessageData>(): T | undefined {
    if (!this.#data) return;
    switch (this.#type) {
      case MessageType.Binary:
        return this.#data as T;
      case MessageType.String:
        return utf8.encode(this.#data) as T;
      case MessageType.Json:
        return JSON.parse(utf8.encode(this.#data)) as T;
      default:
        return;
    }
  }

  verify(message: MessageData): boolean {
    const [data, type] = this.#decodeData(message);
    if (type !== this.#type) return false;
    return areEqual(this.#hash, blake2b256(data));
  }
}
