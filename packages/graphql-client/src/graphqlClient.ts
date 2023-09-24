import {
  SignedTransaction as gqlSignedTransaction,
  Header,
  QueryBoxesArgs
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
import { Client, createClient, fetchExchange, gql } from "@urql/core";
import { castSignedTxToGql } from "./utils";

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees or Base58-encoded addresses */
  contracts?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;

export class ErgoGraphQLClient implements IChainDataClient<BoxWhere> {
  private _client: Client;

  constructor(graphqlUrl: string) {
    this._client = createClient({
      url: graphqlUrl,
      exchanges: [fetchExchange],
      requestPolicy: "network-only"
    });
  }
  async getUnspentBoxes(q: GraphQLBoxQuery): Promise<ChainClientBox[]> {
    const query = gql<{ boxes: Omit<ChainClientBox, "confirmed">[] }, QueryBoxesArgs>`
      query boxes(
        $boxId: String
        $boxIds: [String!]
        $contract: String
        $contracts: [String!]
        $template: String
        $tokenId: String
        $skip: Int
        $take: Int
      ) {
        boxes(
          boxId: $boxId
          boxIds: $boxIds
          ergoTree: $contract
          ergoTrees: $contracts
          ergoTreeTemplateHash: $template
          tokenId: $tokenId
          skip: $skip
          take: $take
        ) {
          boxId
          transactionId
          index
          value
          creationHeight
          ergoTree
          assets {
            tokenId
            amount
          }
          additionalRegisters
        }
      }
    `;

    const response = await this._client.query(query, {
      boxId: q.where.boxId,
      boxIds: q.where.boxIds,
      address: q.where.contract,
      addresses: q.where.contracts,
      ergoTreeTemplateHash: q.where.template,
      tokenId: q.where.tokenId,
      skip: q.skip,
      take: q.take,
      spent: false
    });

    // What to do about confirmed?
    return response.data?.boxes.map((box) => ({ ...box, confirmed: true })) ?? [];
  }
  async getLastHeaders(count: number): Promise<BlockHeader[]> {
    const query = gql<{ blockHeaders: Header[] }, { count: number }>`
      query blockHeaders($count: Int) {
        blockHeaders(take: $count) {
          headerId
          timestamp
          version
          adProofsRoot
          stateRoot
          transactionsRoot
          nBits
          extensionHash
          powSolutions
          height
          difficulty
          parentId
          votes
        }
      }
    `;

    const response = await this._client.query(query, { count });

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
    const query = gql<{ checkTransaction: string }, { tx: gqlSignedTransaction }>`
      mutation checkTransaction($tx: SignedTransaction!) {
        checkTransaction(signedTransaction: $tx)
      }
    `;

    const response = await this._client.mutation(query, { tx: castSignedTxToGql(transaction) });

    if (response.data?.checkTransaction === transaction.id) {
      return true;
    }

    return false;
  }
  async submitTransaction(transaction: SignedTransaction): Promise<string> {
    const query = gql<{ submitTransaction: string }, { tx: gqlSignedTransaction }>`
      mutation submitTransaction($tx: SignedTransaction!) {
        submitTransaction(signedTransaction: $tx)
      }
    `;

    const response = await this._client.mutation(query, { tx: castSignedTxToGql(transaction) });

    return response.data?.submitTransaction ?? "";
  }
  reduceTransaction(): Promise<string> {
    throw new NotSupportedError("Reducing transactions is not supported by ergo-graphql yet.");
  }
}
