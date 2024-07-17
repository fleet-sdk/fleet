import type {
  Box,
  QueryBoxesArgs,
  Header,
  QueryBlockHeadersArgs
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
  type UnsignedTransaction,
  some,
  uniq,
  uniqBy
} from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import type {
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
  type GraphQLOperation,
  type GraphQLRequestOptions,
  type GraphQLSuccessResponse,
  type GraphQLThrowableOptions,
  type GraphQLVariables,
  isRequestParam
} from "../utils";
import {
  ALL_BOXES_QUERY,
  CHECK_TX_MUTATION,
  CONF_BOXES_QUERY,
  HEADERS_QUERY,
  REDUCE_TX_MUTATION,
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
export type ErgoGraphQLRequestOptions = Omit<
  GraphQLRequestOptions,
  "throwOnNonNetworkError"
>;

type ConfirmedBoxesResponse = { boxes: Box[] };
type UnconfirmedBoxesResponse = { mempool: { boxes: Box[] } };
type CombinedBoxesResponse = ConfirmedBoxesResponse & UnconfirmedBoxesResponse;
type BlockHeadersResponse = { blockHeaders: Header[] };
type CheckTransactionResponse = { checkTransaction: string };
type TransactionSubmissionResponse = { submitTransaction: string };
type SignedTxArgsResp = { signedTransaction: SignedTransaction };
type ReduceTxArgs = {
  transaction: {
    inputs: string[];
    dataInputs: string[];
    outputs: string[];
  };
};
type TransactionReductionResponse = { reduceTransaction: HexString };

const PAGE_SIZE = 50;

export class ErgoGraphQLProvider implements IBlockchainProvider<BoxWhere> {
  #options: GraphQLThrowableOptions;

  #getConfBoxes;
  #getUnconfBoxes;
  #getAllBoxes;
  #getHeaders;
  #checkTx;
  #sendTx;
  #reduceTx;

  constructor(url: string | URL);
  constructor(url: ErgoGraphQLRequestOptions);
  constructor(optOrUrl: ErgoGraphQLRequestOptions | string | URL) {
    this.#options = {
      ...(isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl }),
      throwOnNonNetworkErrors: true
    };

    this.#getConfBoxes = this.createOperation<
      ConfirmedBoxesResponse,
      QueryBoxesArgs
    >(CONF_BOXES_QUERY);

    this.#getUnconfBoxes = this.createOperation<
      UnconfirmedBoxesResponse,
      QueryBoxesArgs
    >(UNCONF_BOXES_QUERY);

    this.#getAllBoxes = this.createOperation<
      CombinedBoxesResponse,
      QueryBoxesArgs
    >(ALL_BOXES_QUERY);

    this.#getHeaders = this.createOperation<
      BlockHeadersResponse,
      QueryBlockHeadersArgs
    >(HEADERS_QUERY);

    this.#checkTx = this.createOperation<
      CheckTransactionResponse,
      SignedTxArgsResp
    >(CHECK_TX_MUTATION);

    this.#sendTx = this.createOperation<
      TransactionSubmissionResponse,
      SignedTxArgsResp
    >(SEND_TX_MUTATION);

    this.#reduceTx = this.createOperation<
      TransactionReductionResponse,
      ReduceTxArgs
    >(REDUCE_TX_MUTATION);
  }

  #fetchBoxes(args: QueryBoxesArgs, inclConf: boolean, inclUnconf: boolean) {
    return inclConf && inclUnconf
      ? this.#getAllBoxes(args)
      : inclUnconf
        ? this.#getUnconfBoxes(args)
        : this.#getConfBoxes(args);
  }

  async *streamBoxes(
    query: GraphQLBoxQuery
  ): AsyncGenerator<ChainProviderBox[]> {
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

  async reduceTransaction(
    transaction: UnsignedTransaction
  ): Promise<TransactionReductionResult> {
    try {
      // TODO: Write stringify function
      const response = await this.#reduceTx({
        transaction: {
          inputs: transaction.inputs.map((input) => input.boxId),
          dataInputs: transaction.dataInputs.map((input) => input.boxId),
          outputs: transaction.outputs.map((output) => output.ergoTree)
        }
      });
      return {
        success: true,
        reducedTransaction: response.data.reduceTransaction
      };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
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
        ? ErgoAddress.fromBase58(address).ergoTree
        : address.ergoTree
    );

    args.ergoTrees = uniq(
      some(args.ergoTrees) ? args.ergoTrees.concat(trees) : trees
    );
  }

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
