import { AddressType, areEqual, Base58String, isHex, Network } from "@fleet-sdk/common";
import { base58, blake2b256, ByteInput, ensureBytes, hex, utf8 } from "@fleet-sdk/crypto";
import { SigmaWriter } from "@fleet-sdk/serializer";
import { JsonObject, JsonValue } from "type-fest";
import { encodeAddress, unpackAddress, validateUnpackedAddress } from "./utils";

const SERIALIZED_HASH_LENGTH = 34; // invalidation byte (1) + network type (1) + hash (32)

export type NetworkOptions = {
  network?: Network;
};

export type ErgoMessageFromHashOptions = NetworkOptions & {
  hash: ByteInput;
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

  get network(): Network {
    return this.#network;
  }

  #decodeData(data: MessageData): [Uint8Array, MessageType] {
    if (typeof data === "string") {
      return isHex(data)
        ? [hex.decode(data), MessageType.Binary]
        : [utf8.decode(data), MessageType.String];
    } else if (data instanceof Uint8Array) {
      return [data, MessageType.Binary];
    } else {
      return [utf8.decode(JSON.stringify(data)), MessageType.Json];
    }
  }

  static decode(encodedHash: Base58String): ErgoMessage {
    const unpacked = unpackAddress(base58.decode(encodedHash));
    if (unpacked.type !== AddressType.ADH) throw new Error("Invalid message type");
    if (!validateUnpackedAddress(unpacked)) throw new Error("Invalid encoded message hash");

    return new ErgoMessage({ hash: unpacked.body, network: unpacked.network });
  }

  static fromBase58(encodedHash: Base58String): ErgoMessage {
    return ErgoMessage.decode(encodedHash);
  }

  static fromData(data: MessageData, network?: Network): ErgoMessage {
    return new ErgoMessage({ data, network });
  }

  encode(network?: Network): string {
    return encodeAddress(network ?? this.#network, AddressType.ADH, this.hash);
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
      case MessageType.String:
        return utf8.encode(this.#data) as T;
      case MessageType.Json:
        return JSON.parse(utf8.encode(this.#data)) as T;
      default:
        return this.#data as T;
    }
  }

  serialize(): SigmaWriter {
    return new SigmaWriter(SERIALIZED_HASH_LENGTH)
      .write(0x0) // invalidation byte, see: https://github.com/ergoplatform/eips/blob/master/eip-0044.md#why-prefix-it-with-0x0
      .write(this.#network)
      .writeBytes(this.#hash);
  }

  verify(message: MessageData): boolean {
    const [data] = this.#decodeData(message);
    return areEqual(this.#hash, blake2b256(data));
  }
}
