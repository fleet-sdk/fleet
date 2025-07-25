import { type Base58String, type HexString, Network, ergoTreeHeaderFlags } from "@fleet-sdk/common";
import { type ByteInput, hex } from "@fleet-sdk/crypto";
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
  #constants: SConstant[] = [];

  constructor(input: ByteInput, network?: Network) {
    this.#byteReader = new SigmaByteReader(input);

    this.#header = this.#byteReader.readByte();
    this.#network = network ?? Network.Mainnet;
  }

  static from(input: JsonCompilerOutput, network?: Network): ErgoTree {
    return new ErgoTree(reconstructTreeFromObject(input).toBytes(), network);
  }

  get bytes(): Uint8Array {
    return this.serialize();
  }

  get header(): number {
    return this.#header;
  }

  get version(): number {
    return getVersion(this.#header);
  }

  get hasSegregatedConstants(): boolean {
    return hasFlag(this.#header, ergoTreeHeaderFlags.constantSegregation);
  }

  get hasSize(): boolean {
    return hasFlag(this.#header, ergoTreeHeaderFlags.sizeInclusion);
  }

  get constants(): ReadonlyArray<SConstant> {
    if (!this.hasSegregatedConstants) return [];
    return this.#parse().#constants.slice();
  }

  get template(): Readonly<Uint8Array> {
    return this.#parse().#root.slice();
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

    const segregatedFlag = this.hasSegregatedConstants;
    const sizeFlag = this.hasSize;

    let constantsSize = 0;
    if (segregatedFlag) {
      constantsSize =
        estimateVLQSize(this.#constants.length) +
        this.#constants.reduce((acc, constant) => acc + constant.bytes.length, 0);
    }

    const treeSize = constantsSize + this.#root.length;
    let totalSize = HEADER_SIZE + treeSize;
    if (sizeFlag) totalSize += estimateVLQSize(totalSize);

    const writer = new SigmaByteWriter(totalSize).write(this.#header);
    if (sizeFlag) writer.writeUInt(treeSize);
    if (segregatedFlag) writer.writeArray(this.#constants, (w, c) => w.writeBytes(c.bytes));
    return writer.writeBytes(this.#root).toBytes();
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

function hasFlag(header: number, flag: number): boolean {
  return (header & flag) !== 0;
}

function getVersion(header: number): number {
  return header & VERSION_MASK;
}

function reconstructTreeFromObject(input: JsonCompilerOutput): SigmaByteWriter {
  const numHead = Number.parseInt(input.header, 16);
  const sizeDelimited = hasFlag(numHead, ergoTreeHeaderFlags.sizeInclusion);
  const constSegregated = hasFlag(numHead, ergoTreeHeaderFlags.constantSegregation);

  let len = input.constants?.reduce((acc, c) => acc + c.value.length / 2, 0) ?? 0;
  len += estimateVLQSize(len);
  const constBytes =
    constSegregated && input.constants
      ? new SigmaByteWriter(len)
          .writeArray(input.constants, (w, c) => w.writeHex(c.value))
          .toBytes()
      : new Uint8Array(0);

  len = constBytes.length + (input.header.length + input.expressionTree.length) / 2;
  len += estimateVLQSize(len);
  const writer = new SigmaByteWriter(len).write(numHead);

  if (sizeDelimited) {
    writer.writeUInt(constBytes.length + input.expressionTree.length / 2);
  }

  return writer.writeBytes(constBytes).writeHex(input.expressionTree);
}

export interface ConstantInfo {
  value: string;
  type: string;
  name?: string;
  description?: string;
}

export interface JsonCompilerOutput {
  header: string;
  expressionTree: string;
  constants?: ConstantInfo[];
}
