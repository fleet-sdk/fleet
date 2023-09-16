import { Header, QueryBoxesArgs } from "@ergo-graphql/types";
import { HexString } from "@fleet-sdk/common";
import {
  BlockHeader,
  BoxQuery,
  BoxWhere,
  ChainClientBox,
  IChainDataClient,
  SignedTransaction,
  UnsignedTransaction
} from "@fleet-sdk/common";
import { Client, createClient, fetchExchange, gql } from "@urql/core";

export type GraphQLBoxWhere = BoxWhere & {
  /** Base16-encoded BoxIds */
  boxIds?: HexString[];

  /** Base16-encoded ErgoTrees or Base58-encoded addresses */
  contracts?: HexString[];
};

export type GraphQLBoxQuery = BoxQuery<GraphQLBoxWhere>;

export class GraphqlClient implements IChainDataClient<BoxWhere> {
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
  checkTransaction(transaction: SignedTransaction): Promise<boolean> {
    // Size is missing from SignedTransaction! What to do?
    throw new Error("Method not implemented.");
  }
  submitTransaction(transaction: SignedTransaction): Promise<string> {
    // Same as checkTransaction
    throw new Error("Method not implemented.");
  }
  reduceTransaction(transaction: UnsignedTransaction): Promise<string> {
    // It's not implemented in graphql. What to do?
    throw new Error("Method not implemented.");
  }
}
