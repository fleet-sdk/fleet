import type { Box } from "@fleet-sdk/common";
import { SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { blake2b256, randomBytes } from "@fleet-sdk/crypto";
import { serializeBox } from "@fleet-sdk/serializer";
import { AvlTree$, type BlockchainStateContext, GroupElement$ } from "sigmastate-js/main";

type MockBoxOptions = Partial<Omit<Box<bigint>, "boxId">> & {
  ergoTree: string;
};

export function mockUTxO(mock: MockBoxOptions): Box<bigint> {
  const box: Box<bigint> = {
    boxId: "",

    value: mock.value ?? SAFE_MIN_BOX_VALUE,
    ergoTree: mock.ergoTree,
    assets: mock.assets ?? [],
    creationHeight: mock.creationHeight ?? 849741,
    additionalRegisters: mock.additionalRegisters ?? {},

    transactionId: mock.transactionId ?? getRandomId(),
    index: mock.index ?? 0
  };

  const bytes = serializeBox(box).toBytes();
  box.boxId = hex.encode(blake2b256(bytes));

  return box;
}

function getRandomId() {
  return hex.encode(randomBytes(32));
}

const BLOCK_TIME = 2;

export type HeaderMockingOptions = {
  parentId?: string;
  version?: number;
  fromHeight?: number;
  fromTimestamp?: number;
};

export type BlockchainContextMockingOptions = {
  headers?: { quantity: number } & HeaderMockingOptions;
};

export type PoWSolutions = { pk: string; w: string; n: string; d: string };

export type Header = {
  id: string;
  parentId: string;
  version: number;
  height: number;
  adProofsRoot: string;
  stateRoot: string;
  transactionsRoot: string;
  timestamp: number;
  nBits: number;
  extensionHash: string;
  powSolutions: PoWSolutions;
  votes: string;
};

export function mockHeaders(count: number, options?: HeaderMockingOptions) {
  const headers = new Array<Header>(count);
  const height = (options?.fromHeight ?? 0) + count;
  const timestamp = options?.fromTimestamp ? new Date(options.fromTimestamp) : new Date();
  const version = options?.version ?? 3;
  let parentId = options?.parentId || getRandomId();

  for (let i = 0; i < count; i++) {
    const id = getRandomId();
    if (i > 0) timestamp.setMinutes(timestamp.getMinutes() - BLOCK_TIME);

    headers[i] = {
      id,
      parentId,
      version,
      height: height - i,
      adProofsRoot: "094a38dca68383996db603b11d7a4a2c2ca2cfd45946208c89fdcf73fa4bed2f",
      stateRoot: "6c64d4ffdf34b31b81c8fbb7cebb78ce12f5c7e5c61864c6523bf1481c8011c619",
      transactionsRoot:
        "0c9778e550d39b8423a2247a73a05169369054ef6edaf30f2842b223ed3cc450",
      timestamp: timestamp.getTime(),
      nBits: 118081018,
      extensionHash: "33c61204c775128d6d19754d9be6b4c7ab06a2af7d8f95e6662df476a394be51",
      powSolutions: {
        pk: "0295facb78290ac2b55f1453204d49df37be5bae9f185ed6704c1ba3ee372280c1",
        w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        n: "712b000abb1f4e33",
        d: "0"
      },
      votes: "000000"
    };

    parentId = id;
  }

  return headers.reverse();
}

export function mockBlockchainStateContext(options?: BlockchainContextMockingOptions) {
  const headers = mockHeaders(
    (options?.headers?.quantity ?? 10) + 1,
    options?.headers
  ).map((h) => ({
    ...h,
    ADProofsRoot: h.adProofsRoot,
    stateRoot: AvlTree$.fromDigest(h.stateRoot),
    timestamp: BigInt(h.timestamp),
    nBits: BigInt(h.nBits),
    extensionRoot: h.extensionHash,
    minerPk: GroupElement$.fromPointHex(h.powSolutions.pk),
    powOnetimePk: GroupElement$.fromPointHex(h.powSolutions.w),
    powNonce: h.powSolutions.n,
    powDistance: BigInt(h.powSolutions.d)
  }));

  return {
    sigmaLastHeaders: headers.slice(1),
    previousStateDigest: headers[1].stateRoot.digest,
    sigmaPreHeader: headers[0]
  } as BlockchainStateContext;
}
