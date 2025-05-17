import { type Base58String, type HexString, Network, ergoTreeHeaderFlags } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import {
  SConstant,
  SigmaByteReader,
  SigmaByteWriter,
  estimateVLQSize
} from "@fleet-sdk/serializer";
import { ErgoAddress } from "./ergoAddress";

const VERSION_MASK = 0x07;

export class ErgoTree {
  readonly #header: number;
  readonly #network: Network;

  #reader?: SigmaByteReader;
  #root!: Uint8Array;
  #constants?: SConstant[];

  constructor(input: HexString | Uint8Array, network?: Network) {
    this.#reader = new SigmaByteReader(input);

    this.#header = this.#reader.readByte();
    this.#network = network ?? Network.Mainnet;
  }

  get bytes(): Uint8Array {
    return this.serialize();
  }

  get header(): number {
    return this.#header;
  }

  get version(): number {
    return this.#header & VERSION_MASK;
  }

  get hasSegregatedConstants(): boolean {
    return (this.#header & ergoTreeHeaderFlags.constantSegregation) !== 0;
  }

  get hasSize(): boolean {
    return (this.#header & ergoTreeHeaderFlags.sizeInclusion) !== 0;
  }

  get constants(): SConstant[] | undefined {
    if (!this.hasSegregatedConstants) return undefined;
    if (!this.#parsed) this.#parse();

    return this.#constants;
  }

  get template(): Uint8Array {
    if (!this.#parsed) this.#parse();
    return this.#root;
  }

  get #parsed(): boolean {
    return !!this.#root;
  }

  #parse(): void {
    if (!this.#reader || this.#reader.isEmpty) throw new Error("Empty tree bytes.");

    // header is already read in the constructor
    if (this.hasSize) this.#reader.readUInt(); // read size, but ignore it

    if (!this.hasSegregatedConstants) {
      this.#root = this.#reader.readRemainingBytes();
    } else {
      this.#constants = this.#reader.readArray((r) => SConstant.from(r));
      this.#root = this.#reader.readRemainingBytes();
    }
  }

  serialize(): Uint8Array {
    if (this.#reader?.bytes) return this.#reader.bytes;

    const constantsSize =
      this.hasSegregatedConstants && this.#constants
        ? estimateVLQSize(this.#constants?.length) +
          this.#constants.reduce((acc, constant) => acc + constant.bytes.length, 0)
        : 0;

    const size = 1 /* header */ + constantsSize + this.#root.length;

    return new SigmaByteWriter(size).write(this.#header).writeBytes(this.#root).toBytes();
  }

  toHex(): HexString {
    return hex.encode(this.serialize());
  }

  toAddress(network?: Network): ErgoAddress {
    return ErgoAddress.fromErgoTree(this.serialize(), network ?? this.#network);
  }

  encode(network?: Network): Base58String {
    return this.toAddress(network).encode();
  }
}
