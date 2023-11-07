import {
  Box,
  QueryBoxesArgs as BoxesArgs,
  Header,
  QueryBlockHeadersArgs as HeadersArgs
} from "@ergo-graphql/types";
import {
  BlockHeader,
  ensureDefaults,
  HexString,
  isEmpty,
  NotSupportedError,
  orderBy,
  SignedTransaction,
  some,
  uniqBy
} from "@fleet-sdk/common";
import {
  BoxQuery,
  BoxWhere,
  ChainProviderBox,
  HeaderQuery,
  IBlockchainProvider,
  TransactionEvaluationResult,
  TransactionReductionResult
} from "../types";
import { createGqlOperation, GraphQLRequestOptions, isRequestParam } from "../utils";
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

  /** Base16-encoded ErgoTrees or Base58-encoded addresses */
  contracts?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;

type ConfBoxesResp = { boxes: Box[] };
type UnconfBoxesResp = { mempool: { boxes: Box[] } };
type AllBoxesResp = ConfBoxesResp & UnconfBoxesResp;
type HeadersResp = { blockHeaders: Header[] };
type CheckTxResp = { checkTransaction: string };
type SendTxResp = { submitTransaction: string };
type SignedTxArgsResp = { signedTransaction: SignedTransaction };

const PAGE_SIZE = 50;

export class ErgoGraphQLProvider implements IBlockchainProvider<BoxWhere> {
  #getConfBoxes;
  #getUnconfBoxes;
  #getAllBoxes;
  #getHeaders;
  #checkTx;
  #sendTx;

  constructor(url: string | URL);
  constructor(url: GraphQLRequestOptions);
  constructor(optOrUrl: GraphQLRequestOptions | string | URL) {
    const opt = ensureDefaults<GraphQLRequestOptions, { throwOnNonNetworkError: true }>(
      isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl },
      { throwOnNonNetworkError: true }
    );

    this.#getConfBoxes = createGqlOperation<ConfBoxesResp, BoxesArgs>(CONF_BOXES_QUERY, opt);
    this.#getUnconfBoxes = createGqlOperation<UnconfBoxesResp, BoxesArgs>(UNCONF_BOXES_QUERY, opt);
    this.#getAllBoxes = createGqlOperation<AllBoxesResp, BoxesArgs>(ALL_BOXES_QUERY, opt);
    this.#getHeaders = createGqlOperation<HeadersResp, HeadersArgs>(HEADERS_QUERY, opt);
    this.#checkTx = createGqlOperation<CheckTxResp, SignedTxArgsResp>(CHECK_TX_MUTATION, opt);
    this.#sendTx = createGqlOperation<SendTxResp, SignedTxArgsResp>(SEND_TX_MUTATION, opt);
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
    const includeMempool = from !== "blockchain";
    const queryArgs = {
      spent: false,
      boxIds: where.boxIds ?? (where.boxId ? [where.boxId] : undefined),
      ergoTrees: where.contracts ?? (where.ergoTree ? [where.ergoTree] : undefined),
      ergoTreeTemplateHash: where.templateHash,
      tokenId: where.tokenId,
      skip: 0,
      take: PAGE_SIZE
    } satisfies BoxesArgs;

    let fetchConfirmed = true;
    let fetchMempool = includeMempool;

    do {
      const response = await this.#fetchBoxes(queryArgs, fetchConfirmed, fetchMempool);

      const { data } = response;
      let boxes: ChainProviderBox[] = [];

      if (hasConfirmed(data)) {
        if (some(data.boxes)) {
          const confirmedBoxes = (
            includeMempool ? data.boxes.filter(notBeingSpent) : data.boxes
          ).map(asConfirmed(true));

          boxes = boxes.concat(confirmedBoxes);
        }

        fetchConfirmed = data.boxes.length === PAGE_SIZE;
      }

      if (includeMempool && hasMempool(data)) {
        if (some(data.mempool.boxes)) {
          const mempoolBoxes = data.mempool.boxes.filter(notBeingSpent).map(asConfirmed(false));
          boxes = boxes.concat(mempoolBoxes);
        }

        fetchMempool = data.mempool.boxes.length === PAGE_SIZE;
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

      if (fetchConfirmed || fetchMempool) queryArgs.skip += PAGE_SIZE;
    } while (fetchConfirmed || fetchMempool);
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
