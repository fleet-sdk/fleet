import {
  Box,
  QueryBoxesArgs as BoxesArgs,
  Header,
  QueryBlockHeadersArgs as HeadersArgs
} from "@ergo-graphql/types";
import {
  Base58String,
  BlockHeader,
  ensureDefaults,
  HexString,
  isEmpty,
  isUndefined,
  NotSupportedError,
  orderBy,
  SignedTransaction,
  some,
  uniq,
  uniqBy
} from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import {
  BoxQuery,
  BoxWhere,
  ChainProviderBox,
  HeaderQuery,
  IBlockchainProvider,
  TransactionEvaluationResult,
  TransactionReductionResult
} from "../types/blockchainProvider";
import {
  createGqlOperation,
  GraphQLOperation,
  GraphQLRequestOptions,
  GraphQLSuccessResponse,
  GraphQLThrowableOptions,
  GraphQLVariables,
  isRequestParam
} from "../utils";
import {
  ALL_BOXES_QUERY,
  CHECK_TX_MUTATION,
  CONF_BOXES_QUERY,
  HEADERS_QUERY,
  SEND_TX_MUTATION,
  UNCONF_BOXES_QUERY
} from "./queries";

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees */
  ergoTrees?: HexString[];

  /** Base58-encoded addresses or `ErgoAddress` objects */
  addresses?: (Base58String | ErgoAddress)[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;
export type ErgoGraphQLRequestOptions = Omit<GraphQLRequestOptions, "throwOnNonNetworkError">;

type ConfBoxesResp = { boxes: Box[] };
type UnconfBoxesResp = { mempool: { boxes: Box[] } };
type AllBoxesResp = ConfBoxesResp & UnconfBoxesResp;
type HeadersResp = { blockHeaders: Header[] };
type CheckTxResp = { checkTransaction: string };
type SendTxResp = { submitTransaction: string };
type SignedTxArgsResp = { signedTransaction: SignedTransaction };

const PAGE_SIZE = 50;

export class ErgoGraphQLProvider implements IBlockchainProvider<BoxWhere> {
  #options: GraphQLThrowableOptions;

  #getConfBoxes;
  #getUnconfBoxes;
  #getAllBoxes;
  #getHeaders;
  #checkTx;
  #sendTx;

  constructor(url: string | URL);
  constructor(url: ErgoGraphQLRequestOptions);
  constructor(optOrUrl: ErgoGraphQLRequestOptions | string | URL) {
    this.#options = {
      ...(isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl }),
      throwOnNonNetworkErrors: true
    };

    this.#getConfBoxes = this.createOperation<ConfBoxesResp, BoxesArgs>(CONF_BOXES_QUERY);
    this.#getUnconfBoxes = this.createOperation<UnconfBoxesResp, BoxesArgs>(UNCONF_BOXES_QUERY);
    this.#getAllBoxes = this.createOperation<AllBoxesResp, BoxesArgs>(ALL_BOXES_QUERY);
    this.#getHeaders = this.createOperation<HeadersResp, HeadersArgs>(HEADERS_QUERY);
    this.#checkTx = this.createOperation<CheckTxResp, SignedTxArgsResp>(CHECK_TX_MUTATION);
    this.#sendTx = this.createOperation<SendTxResp, SignedTxArgsResp>(SEND_TX_MUTATION);
  }

  #fetchBoxes(args: BoxesArgs, inclConf: boolean, inclUnconf: boolean) {
    if (inclConf && inclUnconf) {
      return this.#getAllBoxes(args);
    } else if (inclUnconf) {
      return this.#getUnconfBoxes(args);
    } else {
      return this.#getConfBoxes(args);
    }
  }

  async *streamBoxes(query: GraphQLBoxQuery): AsyncGenerator<ChainProviderBox[]> {
    if (isEmpty(query.where)) {
      throw new Error("Cannot fetch unspent boxes without a where clause.");
    }

    const notBeingSpent = (box: Box) => !box.beingSpent;
    const returnedBoxIds = new Set<string>();
    const { where, from } = query;
    const args = buildGqlBoxQueryArgs(where);

    let fetchFromChain = from !== "mempool";
    let fetchFromMempool = from !== "blockchain";
    const isMempoolAware = fetchFromMempool;

    do {
      const response = await this.#fetchBoxes(args, fetchFromChain, fetchFromMempool);

      const { data } = response;
      let boxes: ChainProviderBox[] = [];

      if (fetchFromChain && hasConfirmed(data)) {
        if (some(data.boxes)) {
          const confirmedBoxes = (
            isMempoolAware ? data.boxes.filter(notBeingSpent) : data.boxes
          ).map(asConfirmed(true));

          boxes = boxes.concat(confirmedBoxes);
        }

        fetchFromChain = data.boxes.length === PAGE_SIZE;
      }

      if (isMempoolAware && hasMempool(data)) {
        if (some(data.mempool.boxes)) {
          const mempoolBoxes = data.mempool.boxes.filter(notBeingSpent).map(asConfirmed(false));
          boxes = boxes.concat(mempoolBoxes);
        }

        fetchFromMempool = data.mempool.boxes.length === PAGE_SIZE;
      }

      if (some(boxes)) {
        // boxes can be moved from the mempool to the blockchain while streaming,
        // so we need to filter out boxes that have already been returned.
        if (boxes.some((box) => returnedBoxIds.has(box.boxId))) {
          boxes = boxes.filter((b) => !returnedBoxIds.has(b.boxId));
        }

        if (some(boxes)) {
          boxes = uniqBy(boxes, (box) => box.boxId);
          boxes.forEach((box) => returnedBoxIds.add(box.boxId));

          yield boxes;
        }
      }

      if (fetchFromChain || fetchFromMempool) args.skip += PAGE_SIZE;
    } while (fetchFromChain || fetchFromMempool);
  }

  async getBoxes(query: GraphQLBoxQuery): Promise<ChainProviderBox[]> {
    let boxes: ChainProviderBox[] = [];
    for await (const chunk of this.streamBoxes(query)) {
      boxes = boxes.concat(chunk);
    }

    return orderBy(boxes, (box) => box.creationHeight);
  }

  async getHeaders(query: HeaderQuery): Promise<BlockHeader[]> {
    const response = await this.#getHeaders(query);

    return (
      response.data?.blockHeaders.map((header) => ({
        ...header,
        id: header.headerId,
        timestamp: Number(header.timestamp),
        nBits: Number(header.nBits),
        votes: header.votes.join("")
      })) ?? []
    );
  }

  createOperation<R, V extends GraphQLVariables = GraphQLVariables>(
    query: string,
    options?: Partial<ErgoGraphQLRequestOptions>
  ): GraphQLOperation<GraphQLSuccessResponse<R>, V> {
    const opt = ensureDefaults(options, this.#options);
    opt.throwOnNonNetworkErrors = true;

    return createGqlOperation(query, opt);
  }

  async checkTransaction(
    signedTransaction: SignedTransaction
  ): Promise<TransactionEvaluationResult> {
    try {
      const response = await this.#checkTx({ signedTransaction });

      return { success: true, transactionId: response.data.checkTransaction };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  async submitTransaction(
    signedTransaction: SignedTransaction
  ): Promise<TransactionEvaluationResult> {
    try {
      const response = await this.#sendTx({ signedTransaction });

      return { success: true, transactionId: response.data.submitTransaction };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  reduceTransaction(): Promise<TransactionReductionResult> {
    throw new NotSupportedError("Transaction reducing is not supported by ergo-graphql.");
  }
}

function buildGqlBoxQueryArgs(where: GraphQLBoxWhere) {
  const args = {
    spent: false,
    boxIds: merge(where.boxIds, where.boxId),
    ergoTrees: merge(where.ergoTrees, where.ergoTree),
    ergoTreeTemplateHash: where.templateHash,
    tokenId: where.tokenId,
    skip: 0,
    take: PAGE_SIZE
  } satisfies BoxesArgs;

  const addresses = merge(where.addresses, where.address);
  if (some(addresses)) {
    const trees = addresses.map((address) =>
      typeof address === "string" ? ErgoAddress.fromBase58(address).ergoTree : address.ergoTree
    );

    args.ergoTrees = uniq(some(args.ergoTrees) ? args.ergoTrees.concat(trees) : trees);
  }

  return args;
}

function merge<T>(array?: T[], el?: T) {
  if (isEmpty(array) && isUndefined(el)) return;

  const set = new Set<T>(array ?? []);
  if (!isUndefined(el)) set.add(el);
  return Array.from(set.values());
}

function hasMempool(data: AllBoxesResp | ConfBoxesResp | UnconfBoxesResp): data is UnconfBoxesResp {
  return !!(data as UnconfBoxesResp)?.mempool?.boxes;
}

function hasConfirmed(data: AllBoxesResp | ConfBoxesResp | UnconfBoxesResp): data is ConfBoxesResp {
  return !!(data as ConfBoxesResp)?.boxes;
}

function asConfirmed(confirmed: boolean) {
  return (box: Box): ChainProviderBox => ({
    ...box,
    value: BigInt(box.value),
    assets: box.assets.map((asset) => ({
      tokenId: asset.tokenId,
      amount: BigInt(asset.amount)
    })),
    confirmed
  });
}
