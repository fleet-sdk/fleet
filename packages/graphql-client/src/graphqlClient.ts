import {
  Box,
  QueryBoxesArgs as BoxesArgs,
  MutationCheckTransactionArgs as CheckTxArgs,
  Header,
  QueryBlockHeadersArgs as HeadersArgs,
  MutationSubmitTransactionArgs as SendTxArgs
} from "@ergo-graphql/types";
import {
  BlockHeader,
  BoxQuery,
  BoxWhere,
  ChainClientBox,
  HexString,
  IChainDataClient,
  NotSupportedError,
  SignedTransaction
} from "@fleet-sdk/common";
import { CHECK_TX_MUTATION, CONF_BOX_QUERY, HEADERS_QUERY, SEND_TX_MUTATION } from "./queries";
import { castSignedTxToGql, createOperation, isRequestParam, RequestOptions } from "./utils";

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

export class ErgoGraphQLClient implements IChainDataClient<BoxWhere> {
  #getConfBoxes;
  #getHeaders;
  #checkTx;
  #sendTx;

  constructor(options: RequestOptions);
  constructor(url: string | URL);
  constructor(optOrUrl: RequestOptions | string | URL) {
    const opt = isRequestParam(optOrUrl) ? optOrUrl : { url: optOrUrl };

    this.#getConfBoxes = createOperation<BoxesResponse, BoxesArgs>(CONF_BOX_QUERY, opt);
    this.#getHeaders = createOperation<HeadersResponse, HeadersArgs>(HEADERS_QUERY, opt);
    this.#checkTx = createOperation<CheckTxResponse, CheckTxArgs>(CHECK_TX_MUTATION, opt);
    this.#sendTx = createOperation<SendTxResponse, SendTxArgs>(SEND_TX_MUTATION, opt);
  }

  async getUnspentBoxes(args: GraphQLBoxQuery): Promise<ChainClientBox[]> {
    const response = await this.#getConfBoxes({
      boxIds: args.where.boxIds ?? args.where.boxId ? [args.where.boxId!] : undefined,
      ergoTrees: args.where.contracts ?? args.where.contract ? [args.where.contract!] : undefined,
      ergoTreeTemplateHash: args.where.template,
      tokenId: args.where.tokenId,
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

  async checkTransaction(transaction: SignedTransaction): Promise<boolean> {
    const response = await this.#checkTx({ signedTransaction: castSignedTxToGql(transaction) });

    return response.data?.checkTransaction === transaction.id;
  }

  async submitTransaction(transaction: SignedTransaction): Promise<string> {
    const response = await this.#sendTx({ signedTransaction: castSignedTxToGql(transaction) });

    return response.data?.submitTransaction ?? "";
  }

  reduceTransaction(): Promise<string> {
    throw new NotSupportedError("Reducing transactions is not supported by ergo-graphql yet.");
  }
}
