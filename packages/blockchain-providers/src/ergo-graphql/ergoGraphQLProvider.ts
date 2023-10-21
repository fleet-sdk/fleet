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
  NotSupportedError,
  SignedTransaction,
  TransactionEvaluationResult,
  TransactionReductionResult
} from "@fleet-sdk/common";
import { createGqlOperation, GraphQLRequestOptions, isRequestParam } from "../utils";
import { CHECK_TX_MUTATION, CONF_BOX_QUERY, HEADERS_QUERY, SEND_TX_MUTATION } from "./queries";

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees or Base58-encoded addresses */
  contracts?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;

type BoxesResponse = { boxes: Box[] };
type HeadersResponse = { blockHeaders: Header[] };
type CheckTxResponse = { checkTransaction: string };
type SendTxResponse = { submitTransaction: string };
type SignedTxArgs = { signedTransaction: SignedTransaction };

export class ErgoGraphQLProvider implements IChainDataProvider<BoxWhere> {
  #getConfBoxes;
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
    this.#getHeaders = createGqlOperation<HeadersResponse, HeadersArgs>(HEADERS_QUERY, opt);
    this.#checkTx = createGqlOperation<CheckTxResponse, SignedTxArgs>(CHECK_TX_MUTATION, opt);
    this.#sendTx = createGqlOperation<SendTxResponse, SignedTxArgs>(SEND_TX_MUTATION, opt);
  }

  async getUnspentBoxes(args: GraphQLBoxQuery): Promise<ChainClientBox[]> {
    const response = await this.#getConfBoxes({
      spent: false,
      boxIds: args.where?.boxIds ?? args.where?.boxId ? [args.where.boxId!] : undefined,
      ergoTrees: args.where?.contracts ?? args.where?.contract ? [args.where.contract!] : undefined,
      ergoTreeTemplateHash: args.where?.template,
      tokenId: args.where?.tokenId,
      skip: args.skip,
      take: args.take
    });

    return (
      response.data?.boxes.map((box) => ({
        ...box,
        assets: box.assets.map((asset) => ({
          tokenId: asset.tokenId,
          amount: BigInt(asset.amount)
        })),
        confirmed: true,
        value: BigInt(box.value)
      })) ?? []
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
