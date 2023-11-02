import {
  Box,
  QueryBoxesArgs as BoxesArgs,
  Header,
  QueryBlockHeadersArgs as HeadersArgs
} from "@ergo-graphql/types";
import {
  BlockHeader,
  BoxQuery,
  BoxWhere,
  ChainClientBox,
  ensureDefaults,
  HexString,
  IChainDataProvider,
  isEmpty,
  NotSupportedError,
  SignedTransaction,
  TransactionEvaluationResult,
  TransactionReductionResult
} from "@fleet-sdk/common";
import { some } from "packages/common/src";
import { createGqlOperation, GraphQLRequestOptions, isRequestParam } from "../utils";
import {
  ALL_BOX_QUERY,
  CHECK_TX_MUTATION,
  CONF_BOX_QUERY,
  HEADERS_QUERY,
  SEND_TX_MUTATION,
  UNCONF_BOX_QUERY
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

export class ErgoGraphQLProvider implements IChainDataProvider<BoxWhere> {
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

    this.#getConfBoxes = createGqlOperation<ConfBoxesResp, BoxesArgs>(CONF_BOX_QUERY, opt);
    this.#getUnconfBoxes = createGqlOperation<UnconfBoxesResp, BoxesArgs>(UNCONF_BOX_QUERY, opt);
    this.#getAllBoxes = createGqlOperation<AllBoxesResp, BoxesArgs>(ALL_BOX_QUERY, opt);
    this.#getHeaders = createGqlOperation<HeadersResp, HeadersArgs>(HEADERS_QUERY, opt);
    this.#checkTx = createGqlOperation<CheckTxResp, SignedTxArgsResp>(CHECK_TX_MUTATION, opt);
    this.#sendTx = createGqlOperation<SendTxResp, SignedTxArgsResp>(SEND_TX_MUTATION, opt);
  }

  #fetchBoxes(args: BoxesArgs, inclConf: boolean, inclUnconf: boolean) {
    if (inclConf && inclUnconf) {
      return this.#getAllBoxes(args);
    } else if (inclConf) {
      return this.#getConfBoxes(args);
    } else if (inclUnconf) {
      return this.#getUnconfBoxes(args);
    }

    return;
  }

  async *streamUnspentBoxes(query: GraphQLBoxQuery): AsyncGenerator<ChainClientBox[]> {
    if (isEmpty(query.where)) {
      throw new Error("Cannot fetch unspent boxes without a where clause.");
    }

    const includeMempool = query.includeUnconfirmed || query.includeUnconfirmed === undefined;
    const queryArgs = {
      spent: false,
      boxIds: query.where.boxIds ?? (query.where.boxId ? [query.where.boxId] : undefined),
      ergoTrees:
        query.where.contracts ?? (query.where.contract ? [query.where.contract] : undefined),
      ergoTreeTemplateHash: query.where.template,
      tokenId: query.where.tokenId,
      skip: 0,
      take: PAGE_SIZE
    } satisfies BoxesArgs;

    const notBeingSpent = (box: Box) => !box.beingSpent;
    const returnedBoxIds = new Set<string>();
    let fetchConfirmed = true;
    let fetchMempool = includeMempool;

    do {
      const response = await this.#fetchBoxes(queryArgs, fetchConfirmed, fetchMempool);
      if (!response) break;

      const { data } = response;
      let boxes: ChainClientBox[] = [];

      if (hasMempool(data)) {
        if (some(data.mempool.boxes)) {
          const mempoolBoxes = data.mempool.boxes
            .filter(notBeingSpent)
            .map(mapBoxAsConfirmed(false));

          boxes = boxes.concat(mempoolBoxes);
        }

        fetchMempool = data.mempool.boxes.length === PAGE_SIZE;
      }

      if (hasConfirmed(data)) {
        if (some(data.boxes)) {
          const confirmedBoxes = (
            includeMempool ? data.boxes.filter(notBeingSpent) : data.boxes
          ).map(mapBoxAsConfirmed(true));

          boxes = boxes.concat(confirmedBoxes);
        }

        fetchConfirmed = data.boxes.length === PAGE_SIZE;
      }

      if (some(boxes)) {
        // boxes can be moved from mempool to the blockchain while streaming,
        // so we need to filter out boxes that have already been returned.
        let returnedSome = false;
        for (const box of boxes) {
          if (!returnedSome && returnedBoxIds.has(box.boxId)) {
            returnedSome = true;
          } else {
            returnedBoxIds.add(box.boxId);
          }
        }

        boxes = returnedSome ? boxes.filter((b) => !returnedBoxIds.has(b.boxId)) : boxes;
        if (some(boxes)) {
          yield boxes;
        }
      }

      if (fetchConfirmed || fetchMempool) queryArgs.skip += PAGE_SIZE;
    } while (fetchConfirmed || fetchMempool);
  }

  async getUnspentBoxes(query: GraphQLBoxQuery): Promise<ChainClientBox[]> {
    let boxes: ChainClientBox[] = [];
    for await (const chunk of this.streamUnspentBoxes(query)) {
      boxes = boxes.concat(chunk);
    }

    return boxes;
  }

  async getLastHeaders(count: number): Promise<BlockHeader[]> {
    const response = await this.#getHeaders({ take: count });

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
  return !!(data as UnconfBoxesResp).mempool;
}

function hasConfirmed(data: AllBoxesResp | ConfBoxesResp | UnconfBoxesResp): data is ConfBoxesResp {
  return !!(data as ConfBoxesResp).boxes;
}

function mapBoxAsConfirmed(confirmed: boolean) {
  return (box: Box): ChainClientBox => ({
    ...box,
    value: BigInt(box.value),
    assets: box.assets.map((asset) => ({
      tokenId: asset.tokenId,
      amount: BigInt(asset.amount)
    })),
    confirmed
  });
}
