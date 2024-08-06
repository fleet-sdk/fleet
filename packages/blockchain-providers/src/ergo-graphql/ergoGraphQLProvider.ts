import type {
  Box,
  QueryBoxesArgs,
  Header,
  QueryBlockHeadersArgs,
  Transaction,
  UnconfirmedTransaction
} from "@ergo-graphql/types";
import {
  type Base58String,
  type BlockHeader,
  ensureDefaults,
  type HexString,
  isEmpty,
  isUndefined,
  NotSupportedError,
  orderBy,
  type SignedTransaction,
  some,
  uniq,
  uniqBy
} from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import type {
  BoxQuery,
  BoxWhere,
  ChainProviderBox,
  ChainProviderConfirmedTransaction,
  ChainProviderUnconfirmedTransaction,
  HeaderQuery,
  IBlockchainProvider,
  TransactionEvaluationResult,
  TransactionQuery,
  TransactionReductionResult,
  TransactionWhere
} from "../types/blockchainProvider";
import {
  createGqlOperation,
  type GraphQLOperation,
  type GraphQLRequestOptions,
  type GraphQLSuccessResponse,
  type GraphQLVariables,
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

type GraphQLThrowableOptions = GraphQLRequestOptions & { throwOnNonNetworkErrors: true };

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees */
  ergoTrees?: HexString[];

  /** Base58-encoded addresses or `ErgoAddress` objects */
  addresses?: (Base58String | ErgoAddress)[];
};

export type GraphQLTransactionWhere = TransactionWhere & {
  transactionIds?: HexString[];
  addresses?: (Base58String | ErgoAddress)[];
  ergoTrees?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;
export type ErgoGraphQLRequestOptions = Omit<
  GraphQLRequestOptions,
  "throwOnNonNetworkError"
>;

type ConfirmedBoxesResponse = { boxes: Box[] };
type UnconfirmedBoxesResponse = { mempool: { boxes: Box[] } };
type CombinedBoxesResponse = ConfirmedBoxesResponse & UnconfirmedBoxesResponse;
type UnconfirmedTxResponse = { mempool: { transactions: UnconfirmedTransaction[] } };
type ConfirmedTxResponse = { transactions: Transaction[] };
type BlockHeadersResponse = { blockHeaders: Header[] };
type CheckTransactionResponse = { checkTransaction: string };
type TransactionSubmissionResponse = { submitTransaction: string };
type SignedTxArgsResp = { signedTransaction: SignedTransaction };

const PAGE_SIZE = 50;

export class ErgoGraphQLProvider
  implements IBlockchainProvider<GraphQLBoxWhere, TransactionWhere>
{
  #options: GraphQLThrowableOptions;

  #getConfBoxes;
  #getUnconfBoxes;
  #getAllBoxes;
  #getHeaders;
  #checkTx;
  #sendTx;

  constructor(url: string);
  constructor(url: ErgoGraphQLRequestOptions);
  constructor(optOrUrl: ErgoGraphQLRequestOptions | string) {
    this.#options = {
      ...(isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl }),
      throwOnNonNetworkErrors: true
    };

    this.#getConfBoxes = this.createOperation<ConfirmedBoxesResponse, QueryBoxesArgs>(
      CONF_BOXES_QUERY
    );

    this.#getUnconfBoxes = this.createOperation<UnconfirmedBoxesResponse, QueryBoxesArgs>(
      UNCONF_BOXES_QUERY
    );

    this.#getAllBoxes = this.createOperation<CombinedBoxesResponse, QueryBoxesArgs>(
      ALL_BOXES_QUERY
    );

    this.#getHeaders = this.createOperation<BlockHeadersResponse, QueryBlockHeadersArgs>(
      HEADERS_QUERY
    );

    this.#checkTx = this.createOperation<CheckTransactionResponse, SignedTxArgsResp>(
      CHECK_TX_MUTATION
    );

    this.#sendTx = this.createOperation<TransactionSubmissionResponse, SignedTxArgsResp>(
      SEND_TX_MUTATION
    );
  }

  #fetchBoxes(args: QueryBoxesArgs, inclConf: boolean, inclUnconf: boolean) {
    return inclConf && inclUnconf
      ? this.#getAllBoxes(args, this.#options.url)
      : inclUnconf
        ? this.#getUnconfBoxes(args, this.#options.url)
        : this.#getConfBoxes(args, this.#options.url);
  }

  async updateUrl(url: string) {
    this.#options.url = url;
  }

  async *streamBoxes(query: GraphQLBoxQuery): AsyncGenerator<ChainProviderBox[]> {
    if (isEmpty(query.where)) {
      throw new Error("Cannot fetch unspent boxes without a where clause.");
    }

    const notBeingSpent = (box: Box) => !box.beingSpent;
    const returnedBoxIds = new Set<string>();
    const { where, from } = query;
    const args = buildGqlBoxQueryArgs(where);

    let inclChain = from !== "mempool";
    let inclPool = from !== "blockchain";
    const isMempoolAware = inclPool;

    do {
      const response = await this.#fetchBoxes(args, inclChain, inclPool);

      const { data } = response;
      let boxes: ChainProviderBox[] = [];

      if (inclChain && hasConfirmed(data)) {
        if (some(data.boxes)) {
          const confirmedBoxes = (
            isMempoolAware ? data.boxes.filter(notBeingSpent) : data.boxes
          ).map(asConfirmed(true));

          boxes = boxes.concat(confirmedBoxes);
        }

        inclChain = data.boxes.length === PAGE_SIZE;
      }

      if (isMempoolAware && hasMempool(data)) {
        if (some(data.mempool.boxes)) {
          const mempoolBoxes = data.mempool.boxes
            .filter(notBeingSpent)
            .map(asConfirmed(false));
          boxes = boxes.concat(mempoolBoxes);
        }

        inclPool = data.mempool.boxes.length === PAGE_SIZE;
      }

      if (some(boxes)) {
        // boxes can be moved from the mempool to the blockchain while streaming,
        // so we need to filter out boxes that have already been returned.
        if (boxes.some((box) => returnedBoxIds.has(box.boxId))) {
          boxes = boxes.filter((b) => !returnedBoxIds.has(b.boxId));
        }

        if (some(boxes)) {
          boxes = uniqBy(boxes, (box) => box.boxId);
          for (const box of boxes) returnedBoxIds.add(box.boxId);
          yield boxes;
        }
      }

      if (inclChain || inclPool) args.skip += PAGE_SIZE;
    } while (inclChain || inclPool);
  }

  async getBoxes(query: GraphQLBoxQuery): Promise<ChainProviderBox[]> {
    const boxes: ChainProviderBox[][] = [];
    for await (const chunk of this.streamBoxes(query)) boxes.push(chunk);
    return orderBy(boxes.flat(), (box) => box.creationHeight);
  }

  streamUnconfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): AsyncIterable<ChainProviderUnconfirmedTransaction[]> {
    throw new Error("Method not implemented.");
  }

  getUnconfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): Promise<ChainProviderUnconfirmedTransaction[]> {
    throw new Error("Method not implemented.");
  }

  streamConfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): AsyncIterable<ChainProviderConfirmedTransaction[]> {
    throw new Error("Method not implemented.");
  }

  getConfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): Promise<ChainProviderConfirmedTransaction[]> {
    throw new Error("Method not implemented.");
  }

  async getHeaders(query: HeaderQuery): Promise<BlockHeader[]> {
    const response = await this.#getHeaders(query, this.#options.url);

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
      const response = await this.#checkTx({ signedTransaction }, this.#options.url);
      return { success: true, transactionId: response.data.checkTransaction };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  async submitTransaction(
    signedTransaction: SignedTransaction
  ): Promise<TransactionEvaluationResult> {
    try {
      const response = await this.#sendTx({ signedTransaction }, this.#options.url);
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
  } satisfies QueryBoxesArgs;

  const addresses = merge(where.addresses, where.address);
  if (some(addresses)) {
    const trees = addresses.map((address) =>
      typeof address === "string"
        ? ErgoAddress.decode(address).ergoTree
        : address.ergoTree
    );

    args.ergoTrees = uniq(some(args.ergoTrees) ? args.ergoTrees.concat(trees) : trees);
  }

  return args;
}

function buildGqlTxQueryArgs(where: GraphQLTransactionWhere) {
  const addresses = uniq(
    [
      merge(where.addresses, where.address)?.map((address): string =>
        typeof address === "string" ? address : address.encode()
      ) ?? [],
      merge(where.ergoTrees, where.ergoTree)?.map((tree) =>
        ErgoAddress.fromErgoTree(tree).encode()
      ) ?? []
    ].flat()
  );

  const args = {
    addresses: addresses.length ? addresses : undefined,
    transactionIds: merge(where.transactionIds, where.transactionId),
    skip: 0,
    take: PAGE_SIZE
  };

  return args;
}

function merge<T>(array?: T[], el?: T) {
  if (isEmpty(array) && isUndefined(el)) return;

  const set = new Set<T>(array ?? []);
  if (!isUndefined(el)) set.add(el);
  return Array.from(set.values());
}

function hasMempool(data: unknown): data is UnconfirmedBoxesResponse {
  return !!(data as UnconfirmedBoxesResponse)?.mempool?.boxes;
}

function hasConfirmed(data: unknown): data is ConfirmedBoxesResponse {
  return !!(data as ConfirmedBoxesResponse)?.boxes;
}

function asConfirmed(confirmed: boolean) {
  return (box: Box): ChainProviderBox => ({ ...box, confirmed });
}
