import type {
  Box as GQLBox,
  QueryBoxesArgs,
  Header,
  QueryBlockHeadersArgs,
  Transaction,
  QueryTransactionsArgs,
  MempoolTransactionsArgs,
  UnconfirmedTransaction
} from "@ergo-graphql/types";
import {
  type Base58String,
  type BlockHeader,
  type Box,
  ensureDefaults,
  type HexString,
  isEmpty,
  isUndefined,
  NonMandatoryRegisters,
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
  type GraphQLResponse,
  type GraphQLSuccessResponse,
  type GraphQLVariables,
  isRequestParam
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

type GraphQLThrowableOptions = GraphQLRequestOptions & { throwOnNonNetworkErrors: true };
type OP<R, V extends GraphQLVariables> = GraphQLOperation<GraphQLSuccessResponse<R>, V>;
type BiMapper<T> = (value: string) => T;

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

type ConfirmedBoxesResponse = { boxes: GQLBox[] };
type UnconfirmedBoxesResponse = { mempool: { boxes: GQLBox[] } };
type CombinedBoxesResponse = ConfirmedBoxesResponse & UnconfirmedBoxesResponse;
type UnconfirmedTxResponse = { mempool: { transactions: UnconfirmedTransaction[] } };
type ConfirmedTxResponse = { transactions: Transaction[] };
type BlockHeadersResponse = { blockHeaders: Header[] };
type CheckTransactionResponse = { checkTransaction: string };
type TransactionSubmissionResponse = { submitTransaction: string };
type SignedTxArgsResp = { signedTransaction: SignedTransaction };

const PAGE_SIZE = 50;

export class ErgoGraphQLProvider<I = bigint>
  implements IBlockchainProvider<GraphQLBoxWhere, TransactionWhere, I>
{
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
  constructor(url: ErgoGraphQLRequestOptions);
  constructor(optOrUrl: ErgoGraphQLRequestOptions | string) {
    this.#options = {
      ...(isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl }),
      throwOnNonNetworkErrors: true
    };

    this.#biMapper = (value) => BigInt(value) as I;

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
      ? this.#getAllBoxes(args, this.#options.url)
      : inclUnconf
        ? this.#getUnconfirmedBoxes(args, this.#options.url)
        : this.#getConfirmedBoxes(args, this.#options.url);
  }

  updateUrl(url: string): ErgoGraphQLProvider<I> {
    this.#options.url = url;
    return this;
  }

  setBigIntMapper<M>(mapper: BiMapper<M>): ErgoGraphQLProvider<M> {
    this.#biMapper = mapper as unknown as (value: unknown) => I;
    return this as unknown as ErgoGraphQLProvider<M>;
  }

  async *streamBoxes(query: GraphQLBoxQuery): AsyncGenerator<ChainProviderBox<I>[]> {
    if (isEmpty(query.where)) {
      throw new Error("Cannot fetch unspent boxes without a where clause.");
    }

    const notBeingSpent = (box: GQLBox) => !box.beingSpent;
    const returnedBoxIds = new Set<string>();
    const { where, from } = query;
    const args = buildGqlBoxQueryArgs(where);

    let inclChain = from !== "mempool";
    let inclPool = from !== "blockchain";
    const isMempoolAware = inclPool;

    do {
      const { data } = await this.#fetchBoxes(args, inclChain, inclPool);
      let boxes: ChainProviderBox<I>[] = [];

      if (inclChain && hasConfirmed(data)) {
        if (some(data.boxes)) {
          const confirmedBoxes = (
            isMempoolAware ? data.boxes.filter(notBeingSpent) : data.boxes
          ).map((b) => mapConfirmedBox(b, this.#biMapper));

          boxes = boxes.concat(confirmedBoxes);
        }

        inclChain = data.boxes.length === PAGE_SIZE;
      }

      if (isMempoolAware && hasMempool(data)) {
        if (some(data.mempool.boxes)) {
          const mempoolBoxes = data.mempool.boxes
            .filter(notBeingSpent)
            .map((b) => mapUnconfirmedBox(b, this.#biMapper));
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

  async getBoxes(query: GraphQLBoxQuery): Promise<ChainProviderBox<I>[]> {
    const boxes: ChainProviderBox<I>[][] = [];
    for await (const chunk of this.streamBoxes(query)) boxes.push(chunk);
    return orderBy(boxes.flat(), (box) => box.creationHeight);
  }

  streamUnconfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): AsyncIterable<ChainProviderUnconfirmedTransaction<I>[]> {
    throw new Error("Method not implemented.");
  }

  getUnconfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): Promise<ChainProviderUnconfirmedTransaction<I>[]> {
    throw new Error("Method not implemented.");
  }

  async *streamConfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): AsyncIterable<ChainProviderConfirmedTransaction<I>[]> {
    const args = buildGqlTxQueryArgs(query.where);

    let keepFetching = true;
    while (keepFetching) {
      const response = await this.#getConfirmedTransactions(args);
      if (some(response.data.transactions)) {
        yield response.data.transactions.map((t) =>
          mapConfirmedTransaction(t, this.#biMapper)
        );
      }

      keepFetching = response.data.transactions?.length === PAGE_SIZE;
      if (keepFetching) args.skip += PAGE_SIZE;
    }
  }

  getConfirmedTransactions(
    query: TransactionQuery<TransactionWhere>
  ): Promise<ChainProviderConfirmedTransaction<I>[]> {
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
      const response = await this.#checkTransaction(
        { signedTransaction },
        this.#options.url
      );
      return { success: true, transactionId: response.data.checkTransaction };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  async submitTransaction(
    signedTransaction: SignedTransaction
  ): Promise<TransactionEvaluationResult> {
    try {
      const response = await this.#sendTransaction(
        { signedTransaction },
        this.#options.url
      );
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
  box: GQLBox,
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
