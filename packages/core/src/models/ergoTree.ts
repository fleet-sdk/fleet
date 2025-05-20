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
const HEADER_SIZE = 1; // we treat the header as a single byte for now, but it can be extended in the future

export class ErgoTree {
  readonly #header: number;
  readonly #network: Network;

  #byteReader?: SigmaByteReader;
  #root!: Uint8Array;
  #constants!: SConstant[];

  constructor(input: HexString | Uint8Array, network?: Network) {
    this.#byteReader = new SigmaByteReader(input);

    this.#header = this.#byteReader.readByte();
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
    return this.#parse().#constants;
  }

  get template(): Uint8Array {
    return this.#parse().#root;
  }

  get #parsed(): boolean {
    return !!this.#root;
  }

  replaceConstant(index: number, constant: SConstant): ErgoTree {
    if (!this.hasSegregatedConstants) throw new Error("Constant segregation is not enabled.");

    this.#parse();

    const oldConst = this.#constants?.[index];
    if (!oldConst) throw new Error(`Constant at index ${index} not found.`);
    if (oldConst.type.toString() !== constant.type.toString()) {
      throw new Error(
        `Constant type mismatch: can't replace '${oldConst.type.toString()}' with '${constant.type.toString()}'`
      );
    }

    this.#constants[index] = constant;
    this.#byteReader = undefined; // reset reader to force re-serialization
    return this;
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

  serialize(): Uint8Array {
    if (this.#byteReader) return this.#byteReader.bytes;

    const constantsSize = this.hasSegregatedConstants
      ? estimateVLQSize(this.#constants.length) +
        this.#constants.reduce((acc, constant) => acc + constant.bytes.length, 0)
      : 0;

    const treeSize = constantsSize + this.#root.length;
    let totalSize = HEADER_SIZE + treeSize;
    if (this.hasSize) totalSize += estimateVLQSize(totalSize);

    const writer = new SigmaByteWriter(totalSize).write(this.#header);
    if (this.hasSize) {
      writer.writeUInt(treeSize);
    }

    return writer
      .writeArray(this.#constants, (w, constant) => w.writeBytes(constant.bytes))
      .writeBytes(this.#root)
      .toBytes();
  }

  #parse(): ErgoTree {
    if (this.#parsed) return this; // don't parse again if already parsed
    if (!this.#byteReader || this.#byteReader.isEmpty) throw new Error("Empty tree bytes.");

    // header is already read in the constructor
    if (this.hasSize) this.#byteReader.readUInt(); // read size, but ignore it as it can change

    if (!this.hasSegregatedConstants) {
      this.#root = this.#byteReader.readRemainingBytes();
    } else {
      this.#constants = this.#byteReader.readArray((r) => SConstant.from(r));
      this.#root = this.#byteReader.readRemainingBytes();
    }

    return this;
  }
}
