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
  TransactionReductionResult,
  uniqBy
} from "@fleet-sdk/common";
import { orderBy, some } from "packages/common/src";
import {
  createGqlOperation,
  GraphQLOperation,
  GraphQLRequestOptions,
  GraphQLSuccessResponse,
  GraphQLVariables,
  isRequestParam
} from "../utils";
import {
  ALL_BOX_QUERY,
  CHECK_TX_MUTATION,
  CONF_BOX_QUERY,
  HEADERS_QUERY,
  SEND_TX_MUTATION
} from "./queries";

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees or Base58-encoded addresses */
  contracts?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;

type BoxesResponse = { boxes: Box[] };
type AllBoxesResponse = { boxes: Box[]; mempool: { boxes: Box[] } };
type HeadersResponse = { blockHeaders: Header[] };
type CheckTxResponse = { checkTransaction: string };
type SendTxResponse = { submitTransaction: string };
type SignedTxArgs = { signedTransaction: SignedTransaction };

const PAGE_SIZE = 50;

export class ErgoGraphQLProvider implements IChainDataProvider<BoxWhere> {
  #getConfBoxes;
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

    this.#getConfBoxes = createGqlOperation<BoxesResponse, BoxesArgs>(CONF_BOX_QUERY, opt);
    this.#getAllBoxes = createGqlOperation<AllBoxesResponse, BoxesArgs>(ALL_BOX_QUERY, opt);
    this.#getHeaders = createGqlOperation<HeadersResponse, HeadersArgs>(HEADERS_QUERY, opt);
    this.#checkTx = createGqlOperation<CheckTxResponse, SignedTxArgs>(CHECK_TX_MUTATION, opt);
    this.#sendTx = createGqlOperation<SendTxResponse, SignedTxArgs>(SEND_TX_MUTATION, opt);
  }

  async #getAll<R, T, A extends GraphQLVariables>(
    operation: GraphQLOperation<GraphQLSuccessResponse<T>, A>,
    query: A,
    mapFn: (response: GraphQLSuccessResponse<T>) => R[],
    checkMoreFn: (response: GraphQLSuccessResponse<T>) => boolean
  ): Promise<R[]> {
    const queryArgs = { ...query, skip: 0, take: PAGE_SIZE };
    let result: R[] = [];
    let hasMore: boolean;

    do {
      const response = await operation(queryArgs);
      const data = mapFn(response);

      if (some(data)) {
        result = result.concat(data);
        hasMore = checkMoreFn(response);
      } else {
        hasMore = false;
      }

      if (hasMore) queryArgs.skip += PAGE_SIZE;
    } while (hasMore);

    return result;
  }

  async getUnspentBoxes(args: GraphQLBoxQuery): Promise<ChainClientBox[]> {
    if (isEmpty(args.where)) {
      throw new Error("Cannot fetch unspent boxes without a where clause.");
    }

    const includeUnconfirmed = args.includeUnconfirmed || args.includeUnconfirmed === undefined;
    const query = {
      spent: false,
      boxIds: args.where.boxIds ?? (args.where.boxId ? [args.where.boxId] : undefined),
      ergoTrees: args.where.contracts ?? (args.where.contract ? [args.where.contract] : undefined),
      ergoTreeTemplateHash: args.where.template,
      tokenId: args.where.tokenId
    } satisfies BoxesArgs;

    const responses = await Promise.all([
      this.#getAll(
        this.#getConfBoxes,
        query,
        ({ data }) => {
          const boxes = includeUnconfirmed ? data.boxes.filter((x) => !x.beingSpent) : data.boxes;
          return boxes.map(mapBoxAsConfirmed(true));
        },
        ({ data }) => data.boxes.length === PAGE_SIZE
      ),
      includeUnconfirmed
        ? this.#getAll(
            this.#getConfBoxes,
            query,
            ({ data }) => data.boxes.map(mapBoxAsConfirmed(false)),
            ({ data }) => data.boxes.length === PAGE_SIZE
          )
        : undefined
    ]);

    return orderBy(
      uniqBy(responses.filter(some).flat(), (box) => box.boxId),
      (box) => box.creationHeight
    );
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
