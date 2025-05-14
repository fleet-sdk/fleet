import type {
  Box as GQLBox,
  UnconfirmedBox as GQLUnconfirmedBox,
  Header,
  MempoolTransactionsArgs,
  QueryBlockHeadersArgs,
  QueryBoxesArgs,
  QueryTransactionsArgs,
  Transaction,
  UnconfirmedTransaction
} from "@ergo-graphql/types";
import {
  type Base58String,
  type BlockHeader,
  type HexString,
  NotSupportedError,
  type SignedTransaction,
  chunk,
  ensureDefaults,
  isEmpty,
  isUndefined,
  orderBy,
  some,
  uniq,
  uniqBy
} from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import type {
  BoxQuery,
  BoxWhere,
  ChainProviderBox,
  ChainProviderConfirmedTransaction,
  ChainProviderUnconfirmedTransaction,
  ConfirmedTransactionWhere,
  HeaderQuery,
  IBlockchainProvider,
  TransactionEvaluationResult,
  TransactionQuery,
  TransactionReductionResult,
  UnconfirmedTransactionWhere
} from "../types/blockchainProvider";
import {
  type GraphQLOperation,
  type GraphQLRequestOptions,
  type GraphQLSuccessResponse,
  type GraphQLVariables,
  createGqlOperation
} from "../utils";
import {
  ALL_BOXES_QUERY,
  CHECK_TX_MUTATION,
  CONF_BOXES_QUERY,
  CONF_TX_QUERY,
  HEADERS_QUERY,
  SEND_TX_MUTATION,
  UNCONF_BOXES_QUERY,
  UNCONF_TX_QUERY
} from "./queries";

type SkipAndTake = { skip?: number; take?: number };

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded ErgoTrees */
  ergoTrees?: HexString[];

  /** Base58-encoded addresses or `ErgoAddress` objects */
  addresses?: (Base58String | ErgoAddress)[];
};

export type GraphQLConfirmedTransactionWhere = ConfirmedTransactionWhere & {
  addresses?: (Base58String | ErgoAddress)[];
  ergoTrees?: HexString[];
};

export type GraphQLUnconfirmedTransactionWhere = UnconfirmedTransactionWhere & {
  addresses?: (Base58String | ErgoAddress)[];
  ergoTrees?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;
export type ErgoGraphQLRequestOptions = Omit<GraphQLRequestOptions, "throwOnNonNetworkErrors">;

type ConfirmedBoxesResponse = { boxes: GQLBox[] };
type UnconfirmedBoxesResponse = { mempool: { boxes: GQLBox[] } };
type CombinedBoxesResponse = ConfirmedBoxesResponse & UnconfirmedBoxesResponse;
type UnconfirmedTxResponse = { mempool: { transactions: UnconfirmedTransaction[] } };
type ConfirmedTxResponse = { transactions: Transaction[] };
type BlockHeadersResponse = { blockHeaders: Header[] };
type CheckTransactionResponse = { checkTransaction: string };
type TransactionSubmissionResponse = { submitTransaction: string };
type SignedTxArgsResp = { signedTransaction: SignedTransaction };

type GraphQLThrowableOptions = ErgoGraphQLRequestOptions & {
  throwOnNonNetworkErrors: true;
};

type OP<R, V extends GraphQLVariables> = GraphQLOperation<GraphQLSuccessResponse<R>, V>;
type BiMapper<T> = (value: string) => T;

const PAGE_SIZE = 50;
const MAX_ARGS = 20;

export class ErgoGraphQLProvider<I = bigint> implements IBlockchainProvider<I> {
  #options: GraphQLThrowableOptions;
  #biMapper: BiMapper<I>;

  #getConfirmedBoxes: OP<ConfirmedBoxesResponse, QueryBoxesArgs>;
  #getUnconfirmedBoxes: OP<UnconfirmedBoxesResponse, QueryBoxesArgs>;
  #getAllBoxes: OP<CombinedBoxesResponse, QueryBoxesArgs>;
  #getConfirmedTransactions: OP<ConfirmedTxResponse, QueryTransactionsArgs>;
  #getUnconfirmedTransactions: OP<UnconfirmedTxResponse, MempoolTransactionsArgs>;
  #checkTransaction: OP<CheckTransactionResponse, SignedTxArgsResp>;
  #sendTransaction: OP<TransactionSubmissionResponse, SignedTxArgsResp>;
  #getHeaders!: OP<BlockHeadersResponse, QueryBlockHeadersArgs>;

  constructor(url: string);
  constructor(options: ErgoGraphQLRequestOptions);
  constructor(optOrUrl: ErgoGraphQLRequestOptions | string) {
    this.#biMapper = (value) => BigInt(value) as I;
    this.#options = {
      ...(isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl }),
      throwOnNonNetworkErrors: true
    };

    this.#getConfirmedBoxes = this.createOperation(CONF_BOXES_QUERY);
    this.#getUnconfirmedBoxes = this.createOperation(UNCONF_BOXES_QUERY);
    this.#getAllBoxes = this.createOperation(ALL_BOXES_QUERY);
    this.#getConfirmedTransactions = this.createOperation(CONF_TX_QUERY);
    this.#getUnconfirmedTransactions = this.createOperation(UNCONF_TX_QUERY);
    this.#checkTransaction = this.createOperation(CHECK_TX_MUTATION);
    this.#sendTransaction = this.createOperation(SEND_TX_MUTATION);
    this.#getHeaders = this.createOperation(HEADERS_QUERY);
  }

  #fetchBoxes(args: QueryBoxesArgs, inclConf: boolean, inclUnconf: boolean) {
    return inclConf && inclUnconf
      ? this.#getAllBoxes(args)
      : inclUnconf
        ? this.#getUnconfirmedBoxes(args)
        : this.#getConfirmedBoxes(args);
  }

  setUrl(url: string): ErgoGraphQLProvider<I> {
    this.#options.url = url;
    return this;
  }

  setBigIntMapper<M>(mapper: BiMapper<M>): ErgoGraphQLProvider<M> {
    this.#biMapper = mapper as unknown as BiMapper<I>;
    return this as unknown as ErgoGraphQLProvider<M>;
  }

  async *streamBoxes(query: GraphQLBoxQuery & SkipAndTake): AsyncGenerator<ChainProviderBox<I>[]> {
    if (isEmpty(query.where)) {
      throw new Error("Cannot fetch unspent boxes without a where clause.");
    }

    const notBeingSpent = (box: GQLBox) => !box.beingSpent;
    const returnedBoxIds = new Set<string>();
    const { from, take } = query;
    const pageSize = take ?? PAGE_SIZE;
    const queries = buildGqlBoxQueries(query);
    const isMempoolAware = from !== "blockchain";

    for (const query of queries) {
      let inclChain = from !== "mempool";
      let inclPool = from !== "blockchain";

      while (inclChain || inclPool) {
        const { data } = await this.#fetchBoxes(query, inclChain, inclPool);
        let boxes: ChainProviderBox<I>[] = [];

        if (inclChain && hasConfirmed(data)) {
          if (some(data.boxes)) {
            const confirmedBoxes = (
              isMempoolAware ? data.boxes.filter(notBeingSpent) : data.boxes
            ).map((b) => mapConfirmedBox(b, this.#biMapper));

            boxes = boxes.concat(confirmedBoxes);
          }

          inclChain = data.boxes.length === pageSize;
        }

        if (isMempoolAware && hasMempool(data)) {
          if (some(data.mempool.boxes)) {
            const mempoolBoxes = data.mempool.boxes
              .filter(notBeingSpent)
              .map((b) => mapUnconfirmedBox(b, this.#biMapper));
            boxes = boxes.concat(mempoolBoxes);
          }

          inclPool = data.mempool.boxes.length === pageSize;
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

        if (inclChain || inclPool) query.skip += pageSize;
      }
    }
  }

  async getBoxes(query: GraphQLBoxQuery): Promise<ChainProviderBox<I>[]> {
    const boxes: ChainProviderBox<I>[][] = [];
    for await (const chunk of this.streamBoxes(query)) boxes.push(chunk);
    return orderBy(boxes.flat(), (box) => box.creationHeight);
  }

  async *streamUnconfirmedTransactions(
    query: TransactionQuery<GraphQLUnconfirmedTransactionWhere> & SkipAndTake
  ): AsyncGenerator<ChainProviderUnconfirmedTransaction<I>[]> {
    const pageSize = query.take ?? PAGE_SIZE;
    const queries = buildGqlUnconfirmedTxQueries(query);

    for (const query of queries) {
      let keepFetching = true;
      while (keepFetching) {
        const response = await this.#getUnconfirmedTransactions(query);
        if (some(response.data?.mempool?.transactions)) {
          yield response.data.mempool.transactions.map((t) =>
            mapUnconfirmedTransaction(t, this.#biMapper)
          );
        }

        keepFetching = response.data?.mempool?.transactions?.length === pageSize;
        if (keepFetching) query.skip += pageSize;
      }
    }
  }

  async getUnconfirmedTransactions(
    query: TransactionQuery<GraphQLUnconfirmedTransactionWhere>
  ): Promise<ChainProviderUnconfirmedTransaction<I>[]> {
    const transactions: ChainProviderUnconfirmedTransaction<I>[][] = [];
    for await (const chunk of this.streamUnconfirmedTransactions(query)) {
      transactions.push(chunk);
    }

    return transactions.flat();
  }

  async *streamConfirmedTransactions(
    query: TransactionQuery<GraphQLConfirmedTransactionWhere> & SkipAndTake
  ): AsyncGenerator<ChainProviderConfirmedTransaction<I>[]> {
    const pageSize = query.take ?? PAGE_SIZE;
    const queries = buildGqlConfirmedTxQueries(query);

    for (const query of queries) {
      let keepFetching = true;
      while (keepFetching) {
        const response = await this.#getConfirmedTransactions(query);
        if (some(response.data?.transactions)) {
          yield response.data.transactions.map((t) => mapConfirmedTransaction(t, this.#biMapper));
        }

        keepFetching = response.data?.transactions?.length === pageSize;
        if (keepFetching) query.skip += pageSize;
      }
    }
  }

  async getConfirmedTransactions(
    query: TransactionQuery<GraphQLConfirmedTransactionWhere>
  ): Promise<ChainProviderConfirmedTransaction<I>[]> {
    const transactions: ChainProviderConfirmedTransaction<I>[][] = [];
    for await (const chunk of this.streamConfirmedTransactions(query)) {
      transactions.push(chunk);
    }

    return transactions.flat();
  }

  async getHeaders(query: HeaderQuery): Promise<BlockHeader[]> {
    const response = await this.#getHeaders(query);

    return (
      response.data?.blockHeaders.map((h) => ({
        ...h,
        id: h.headerId,
        timestamp: Number(h.timestamp),
        nBits: Number(h.nBits),
        votes: hex.encode(Uint8Array.from(h.votes))
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
      const response = await this.#checkTransaction({ signedTransaction });
      return { success: true, transactionId: response.data.checkTransaction };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  async submitTransaction(
    signedTransaction: SignedTransaction
  ): Promise<TransactionEvaluationResult> {
    try {
      const response = await this.#sendTransaction({ signedTransaction });
      return { success: true, transactionId: response.data.submitTransaction };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  reduceTransaction(): Promise<TransactionReductionResult> {
    throw new NotSupportedError("Transaction reducing is not supported by ergo-graphql.");
  }
}

function buildGqlBoxQueries(query: GraphQLBoxQuery & SkipAndTake) {
  const ergoTrees = uniq(
    [
      merge(query.where.ergoTrees, query.where.ergoTree) ?? [],
      merge(query.where.addresses, query.where.address)?.map((a) =>
        typeof a === "string" ? ErgoAddress.decode(a).ergoTree : a.ergoTree
      ) ?? []
    ].flat()
  );

  const baseQuery = {
    spent: false,
    boxIds: query.where.boxId ? [query.where.boxId] : undefined,
    ergoTreeTemplateHash: query.where.templateHash,
    tokenId: query.where.tokenId,
    skip: query.skip ?? 0,
    take: query.take ?? PAGE_SIZE
  };

  return isEmpty(ergoTrees)
    ? [baseQuery]
    : chunk(ergoTrees, MAX_ARGS).map((chunk) => ({ ergoTrees: chunk, ...baseQuery }));
}

function buildGqlUnconfirmedTxQueries(
  query: TransactionQuery<GraphQLUnconfirmedTransactionWhere> & SkipAndTake
) {
  const addresses = uniq(
    [
      merge(query.where.addresses, query.where.address)?.map((address): string =>
        typeof address === "string" ? address : address.encode()
      ) ?? [],
      merge(query.where.ergoTrees, query.where.ergoTree)?.map((tree) =>
        ErgoAddress.fromErgoTree(tree).encode()
      ) ?? []
    ].flat()
  );

  const baseQuery = {
    transactionIds: query.where.transactionId ? [query.where.transactionId] : undefined,
    skip: query.skip ?? 0,
    take: query.take ?? PAGE_SIZE
  };

  return isEmpty(addresses)
    ? [baseQuery]
    : chunk(addresses, MAX_ARGS).map((chunk) => ({ addresses: chunk, ...baseQuery }));
}

function buildGqlConfirmedTxQueries(
  query: TransactionQuery<GraphQLConfirmedTransactionWhere> & SkipAndTake
) {
  return buildGqlUnconfirmedTxQueries(
    query as TransactionQuery<GraphQLUnconfirmedTransactionWhere>
  ).map((baseQuery) => ({
    ...baseQuery,
    headerId: query.where.headerId,
    minHeight: query.where.minHeight,
    onlyRelevantOutputs: query.where.onlyRelevantOutputs
  }));
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

function mapConfirmedBox<T>(box: GQLBox, mapper: BiMapper<T>): ChainProviderBox<T> {
  const mapped = mapBox(box, mapper) as ChainProviderBox<T>;
  mapped.confirmed = true;
  return mapped;
}

function mapUnconfirmedBox<T>(box: GQLBox, mapper: BiMapper<T>): ChainProviderBox<T> {
  const mapped = mapBox(box, mapper) as ChainProviderBox<T>;
  mapped.confirmed = false;
  return mapped;
}

function mapBox<T>(
  box: GQLBox | GQLUnconfirmedBox,
  mapper: BiMapper<T>
): Omit<ChainProviderBox<T>, "confirmed"> {
  return {
    boxId: box.boxId,
    transactionId: box.transactionId,
    value: mapper(box.value),
    ergoTree: box.ergoTree,
    assets: box.assets.map((t) => ({ tokenId: t.tokenId, amount: mapper(t.amount) })),
    creationHeight: box.creationHeight,
    additionalRegisters: box.additionalRegisters,
    index: box.index
  };
}

function mapUnconfirmedTransaction<T>(
  tx: UnconfirmedTransaction,
  mapper: BiMapper<T>
): ChainProviderUnconfirmedTransaction<T> {
  return {
    transactionId: tx.transactionId,
    timestamp: Number(tx.timestamp),
    inputs: tx.inputs.map((i) => ({
      spendingProof: {
        // biome-ignore lint/style/noNonNullAssertion: bad type declarations at '@ergo-graphql/type'
        extension: i.extension!,
        // biome-ignore lint/style/noNonNullAssertion: bad type declarations at '@ergo-graphql/type'
        proofBytes: i.proofBytes!
      },
      // biome-ignore lint/style/noNonNullAssertion: bad type declarations at '@ergo-graphql/type'
      ...mapBox(i.box!, mapper)
    })),
    dataInputs: tx.dataInputs.map((di) => ({ boxId: di.boxId })),
    outputs: tx.outputs.map((b) => mapBox(b, mapper)),
    confirmed: false
  };
}

function mapConfirmedTransaction<T>(
  tx: Transaction,
  mapper: BiMapper<T>
): ChainProviderConfirmedTransaction<T> {
  return {
    transactionId: tx.transactionId,
    timestamp: Number(tx.timestamp),
    inputs: tx.inputs.map((i) => ({
      spendingProof: {
        // biome-ignore lint/style/noNonNullAssertion: bad type declarations at '@ergo-graphql/type'
        extension: i.extension!,
        // biome-ignore lint/style/noNonNullAssertion: bad type declarations at '@ergo-graphql/type'
        proofBytes: i.proofBytes!
      },
      // biome-ignore lint/style/noNonNullAssertion: bad type declarations at '@ergo-graphql/type'
      ...mapBox(i.box!, mapper)
    })),
    dataInputs: tx.dataInputs.map((di) => ({ boxId: di.boxId })),
    outputs: tx.outputs.map((b) => mapBox(b, mapper)),
    height: tx.inclusionHeight,
    headerId: tx.headerId,
    index: tx.index,
    confirmed: true
  };
}

export function isRequestParam(obj: unknown): obj is ErgoGraphQLRequestOptions {
  return typeof obj === "object" && (obj as ErgoGraphQLRequestOptions).url !== undefined;
}
