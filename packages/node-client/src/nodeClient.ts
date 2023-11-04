import {
  Amount,
  BlockHeader,
  Box,
  BoxId,
  ErgoTreeHex,
  NewToken,
  NonMandatoryRegisters,
  SignedTransaction,
  SortingDirection,
  TokenId,
  TransactionId
} from "@fleet-sdk/common";
import { ErgoAddress, ErgoBox } from "@fleet-sdk/core";
import { DEFAULT_HEADERS, Fetcher, get, post, RequestOptions, ResponseParser } from "./utils/rest";

export type TokenInfo = {
  id: TokenId;
  boxId: BoxId;
  emissionAmount: bigint;
  name: string;
  description: string;
  decimals: number;
};

export type BalanceInfo = {
  nanoERG: bigint;
  tokens: Array<NewToken<bigint>>;
  confirmed: boolean;
};

export type NodeErrorOutput = {
  error?: number;
  reason?: string;
  detail?: string;
};

export type NodeCompilerOutput = { address?: string } & NodeErrorOutput;
export type NodeSendTransactionOutput = { transactionId?: TransactionId } & NodeErrorOutput;

/**
 * Get a node client
 * @param url : url of the node including the port and the trailing /
 * @param parser : parse the response text and stringify the body for post. Use json-bigint
 *                 to avoid overflow of javascript number.
 * @param fetcher : fetcher to reteive the data
 * @param headers : headers for the get and post request
 * @returns NodeClient
 */
export function getNodeClient(
  url: URL | string,
  parser: ResponseParser = JSON,
  fetcher: Fetcher = fetch,
  headers: Headers = DEFAULT_HEADERS
): NodeClient {
  const nodeOptions: RequestOptions = {
    url: url,
    parser: parser,
    fetcher: fetcher,
    headers: headers
  };

  return new NodeClient(nodeOptions);
}

/**
 * Client for indexed Ergo node (ergo.node.extraIndex = true)
 * Node v5.0.15+ to get all the /blockchain/* endpoints
 */
export class NodeClient {
  private _nodeOptions: RequestOptions;

  constructor(nodeOptions: RequestOptions) {
    this._nodeOptions = nodeOptions;
  }

  /**
   * Get the current node height
   * @returns number
   */
  public async getCurrentHeight(): Promise<number> {
    const res = await this.nodeGetRequest("blockchain/indexedHeight");

    return parseInt(res.fullHeight);
  }

  /**
   * Get the current node indexed height
   * @returns number
   */
  public async getIndexedHeight(): Promise<number> {
    const res = await this.nodeGetRequest("blockchain/indexedHeight");

    return parseInt(res.indexedHeight);
  }

  /**
   * Get a transaction by transactionId
   * @param txId
   * @returns SignedTransaction
   */
  public async getTransactionByTransactionId(txId: TransactionId): Promise<SignedTransaction> {
    const output: SignedTransaction = await this.nodeGetRequest(
      `blockchain/transaction/byId/${txId}`
    );

    return output;
  }

  /**
   * Get a transaction by index
   * @param index
   * @returns SignedTransaction
   */
  public async getTransactionByIndex(index: number): Promise<SignedTransaction> {
    const output: SignedTransaction = await this.nodeGetRequest(
      `blockchain/transaction/byIndex/${index}`
    );

    return output;
  }

  /**
   * Get the historical transactions for an address (limit max 100)
   * @param address
   * @param limit
   * @param offset
   * @returns Array<SignedTransaction>
   */
  public async getTransactionsByAddress(
    address: string | ErgoAddress,
    limit: number = 10,
    offset: number = 0
  ): Promise<Array<SignedTransaction>> {
    const res = await this.nodePostRequest(
      `blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`,
      address.toString()
    );
    const output: Array<SignedTransaction> = res.items;

    return output;
  }

  /**
   * Check if an address was already used
   * @param address
   * @returns boolean, true if the address has one or more transactions
   */
  public async addressHasTransactions(address: string | ErgoAddress): Promise<boolean> {
    const txList = await this.getTransactionsByAddress(address.toString(), 1);
    if (Array.isArray(txList)) {
      return txList.length > 0;
    } else {
      return false;
    }
  }

  /**
   * Get an ergo box by boxId
   * @param boxId
   * @returns ErgoBox
   */
  public async getBoxByBoxId(boxId: BoxId): Promise<ErgoBox> {
    const res = await this.nodeGetRequest(`blockchain/box/byId/${boxId}`);
    const ergoBox = new ErgoBox(res);

    return ergoBox;
  }

  /**
   * Get an ergo box by index
   * @param index
   * @returns ErgoBox
   */
  public async getBoxByIndex(index: number): Promise<ErgoBox> {
    const res = await this.nodeGetRequest(`blockchain/box/byIndex/${index}`);
    const ergoBox = new ErgoBox(res);

    return ergoBox;
  }

  /**
   * Get boxes for an address
   * @param address
   * @param limit
   * @param offset
   * @returns Array<ErgoBox>
   */
  public async getBoxesByAddress(
    address: string | ErgoAddress,
    limit: number = 5,
    offset: number = 0
  ): Promise<Array<ErgoBox>> {
    const res = await this.nodePostRequest(
      `blockchain/box/byAddress?offset=${offset}&limit=${limit}`,
      address.toString()
    );
    const boxes: Array<ErgoBox> = res.items.map(
      (b: Box<Amount, NonMandatoryRegisters>) => new ErgoBox(b)
    );

    return boxes;
  }

  /**
   * Get boxes by ergotree
   * @param ergotree
   * @param limit
   * @param offset
   * @returns Array<ErgoBox>
   */
  public async getBoxesByErgotree(
    ergotree: ErgoTreeHex,
    limit: number = 5,
    offset: number = 0
  ): Promise<Array<ErgoBox>> {
    const res = await this.nodePostRequest(
      `blockchain/box/byErgoTree?offset=${offset}&limit=${limit}`,
      ergotree
    );
    const boxes: Array<ErgoBox> = res.items.map(
      (b: Box<Amount, NonMandatoryRegisters>) => new ErgoBox(b)
    );
    return boxes;
  }

  /**
   * Get UTXOs for an address
   * @param address
   * @param limit
   * @param offset
   * @param sort // desc: new boxes first, asc: old boxes first
   * @param includeUnconfirmed
   * @returns Array<ErgoBox>
   */
  public async getUnspentBoxesByAddress(
    address: string | ErgoAddress,
    limit: number = 5,
    offset: number = 0,
    sort: SortingDirection = "desc",
    includeUnconfirmed: boolean = false
  ): Promise<Array<ErgoBox>> {
    const res = await this.nodePostRequest(
      `blockchain/box/unspent/byAddress?offset=${offset}&limit=${limit}&sortDirection=${sort}&includeUnconfirmed=${includeUnconfirmed}`,
      address.toString()
    );
    const boxes: Array<ErgoBox> = res.map(
      (b: Box<Amount, NonMandatoryRegisters>) => new ErgoBox(b)
    );

    return boxes;
  }

  /**
   * Get UTXOs by ergotree
   * @param ergotree
   * @param limit
   * @param offset
   * @param sort // desc: new boxes first, asc: old boxes first
   * @param includeUnconfirmed
   * @returns Array<ErgoBox>
   */
  public async getUnspentBoxesByErgotree(
    ergotree: ErgoTreeHex,
    limit: number = 5,
    offset: number = 0,
    sort: SortingDirection = "desc",
    includeUnconfirmed: boolean = false
  ): Promise<Array<ErgoBox>> {
    const res = await this.nodePostRequest(
      `blockchain/box/unspent/byErgoTree?offset=${offset}&limit=${limit}&sortDirection=${sort}&includeUnconfirmed=${includeUnconfirmed}`,
      ergotree
    );
    const boxes: Array<ErgoBox> = res.map(
      (b: Box<Amount, NonMandatoryRegisters>) => new ErgoBox(b)
    );

    return boxes;
  }

  /**
   * Get boxes for by tokenId
   * @param tokenId
   * @param limit
   * @param offset
   * @returns Array<ErgoBox>
   */
  public async getBoxesByTokenId(
    tokenId: TokenId,
    limit: number = 5,
    offset: number = 0
  ): Promise<Array<ErgoBox>> {
    const res = await this.nodeGetRequest(
      `blockchain/box/byTokenId/${tokenId}?offset=${offset}&limit=${limit}`
    );
    const boxes: Array<ErgoBox> = res.items.map(
      (b: Box<Amount, NonMandatoryRegisters>) => new ErgoBox(b)
    );

    return boxes;
  }

  /**
   * Get UTXOs for by tokenId
   * @param tokenId
   * @param limit
   * @param offset
   * @param sort
   * @param includeUnconfirmed
   * @returns Array<ErgoBox>
   */
  public async getUnspentBoxesByTokenId(
    tokenId: TokenId,
    limit: number = 5,
    offset: number = 0,
    sort: SortingDirection = "desc",
    includeUnconfirmed: boolean = false
  ): Promise<Array<ErgoBox>> {
    const res = await this.nodeGetRequest(
      `blockchain/box/unspent/byTokenId/${tokenId}?offset=${offset}&limit=${limit}&sortDirection=${sort}&includeUnconfirmed=${includeUnconfirmed}`
    );
    const boxes: Array<ErgoBox> = res.map(
      (b: Box<Amount, NonMandatoryRegisters>) => new ErgoBox(b)
    );

    return boxes;
  }

  /**
   * Get the balance for an address
   * @param address
   * @param confirmed
   * @returns BalanceInfo
   */
  public async getBalanceByAddress(
    address: string | ErgoAddress,
    confirmed: boolean = true
  ): Promise<BalanceInfo> {
    const res = await this.nodePostRequest(`blockchain/balance`, address.toString());
    const balance: BalanceInfo = { nanoERG: BigInt(0), tokens: [], confirmed: true };
    if (confirmed) {
      if (res && res.confirmed && res.confirmed.tokens) {
        if (res.confirmed.nanoErgs) {
          balance.nanoERG = BigInt(res.confirmed.nanoErgs);
        }
        if (res.confirmed.tokens) {
          const confirmedTokens: Array<NewToken<bigint>> = res.confirmed.tokens;
          balance.tokens = confirmedTokens;
        }
      }
    } else {
      if (res && res.unconfirmed) {
        if (res.unconfirmed.nanoErgs) {
          balance.nanoERG = BigInt(res.unconfirmed.nanoErgs);
        }
        if (res.unconfirmed.tokens) {
          const unConfirmedTokens: Array<NewToken<bigint>> = res.unconfirmed.tokens;
          balance.tokens = unConfirmedTokens;
        }
      }
    }

    return balance;
  }

  /**
   * Get the last [count] BlockHeaders
   * @param count
   * @returns Array<BlockHeader>
   */
  public async getLastHeaders(count: number = 10): Promise<Array<BlockHeader>> {
    const res = await this.nodeGetRequest(`blocks/lastHeaders/${count}`);

    return res;
  }

  /**
   * Get the information about a token
   * @param tokenId
   * @returns TokenInfo
   */
  public async getTokenInfo(tokenId: TokenId): Promise<TokenInfo> {
    const tokenInfo: TokenInfo = await this.nodeGetRequest(`blockchain/token/byId/${tokenId}`);

    return tokenInfo;
  }

  /**
   * Get the information about the connected ergo node
   * @returns NodeInfo
   */
  public async getNodeInfo() {
    const tokenInfo = await this.nodeGetRequest(`info`);

    return tokenInfo;
  }

  /**
   * Compile an ergoscript string to an ergo address
   * @param script
   * @returns NodeCompilerOutput
   */
  public async compileErgoscript(script: string): Promise<NodeCompilerOutput> {
    const res = await this.nodePostRequest(`script/p2sAddress`, { source: script });
    if (res.error) {
      const outputError: NodeCompilerOutput = res;

      return outputError;
    } else {
      const outputSuccess: NodeCompilerOutput = res;

      return outputSuccess;
    }
  }

  /**
   * Send a transaction to the node mempool
   * @param tx
   * @returns TransactionId
   */
  public async sendTransaction(tx: SignedTransaction): Promise<NodeSendTransactionOutput> {
    const res = await this.nodePostRequest("transactions", tx);
    if (res.error) {
      const out: NodeErrorOutput = res;

      return out;
    } else {
      const out = { transactionId: res };

      return out;
    }
  }

  /**
   * Check a signed transaction, returns the transactionId if succeeds
   * @param tx
   * @returns
   */
  public async checkTransaction(tx: SignedTransaction): Promise<NodeSendTransactionOutput> {
    const res = await this.nodePostRequest("transactions/check", tx);
    if (res.error) {
      const out: NodeErrorOutput = res;

      return out;
    } else {
      const out = { transactionId: res };

      return out;
    }
  }

  /**
   * Get current pool of the unconfirmed transactions pool
   * @param limit : default 50
   * @param offset : default 0
   * @returns Array<SignedTransaction>
   */
  public async getUnconfirmedTransactions(
    limit: number = 50,
    offset: number = 0
  ): Promise<Array<SignedTransaction>> {
    const res: Array<SignedTransaction> = await this.nodeGetRequest(
      `transactions/unconfirmed?offset=${offset}&limit=${limit}`
    );

    return res;
  }

  /**
   * Get an unconfirmed transaction by transactionId from the mempool, returns undefined if not found
   * @param txId
   * @returns SignedTransaction | undefined
   */
  public async getUnconfirmedTransactionsByTransactionId(
    txId: TransactionId
  ): Promise<SignedTransaction | undefined> {
    const res: SignedTransaction & NodeErrorOutput = await this.nodeGetRequest(
      `transactions/unconfirmed/byTransactionId/${txId}`
    );
    if (res.error) {
      return;
    } else {
      return res;
    }
  }

  /**
   * Finds unconfirmed transactions by ErgoTree hex of one of its output or input boxes (if present in UtxoState)
   * @param ergotree
   * @param limit
   * @param offset
   * @returns Array<SignedTransaction>
   */
  public async getUnconfirmedTransactionsByErgoTree(
    ergotree: ErgoTreeHex,
    limit: number = 50,
    offset: number = 0
  ): Promise<Array<SignedTransaction>> {
    const res: Array<SignedTransaction> = await this.nodePostRequest(
      `transactions/unconfirmed/byErgoTree?offset=${offset}&limit=${limit}`,
      ergotree
    );

    return res;
  }

  /**
   * Generic get request to the node
   * @param url : url to fetch without the node base url
   * for example for information about the node: nodeGetRequest('info')
   *             for box by boxId: nodeGetRequest('blockchain/box/byId/{boxId}')
   * @returns any
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public async nodeGetRequest(url: string): Promise<any> {
    const res = await get(this._updateOptionURL(url));

    return res;
  }

  /**
   * Generic post request to the node
   * @param url : url to fetch without the node base url
   * for example for the balance of an address: nodePostRequest('blockchain/balance', "address" )
   * @param body : body to post
   * @returns any
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public async nodePostRequest(url: string, body: any = {}): Promise<any> {
    const res = await post(body, this._updateOptionURL(url));

    return res;
  }

  public get nodeOptions(): RequestOptions {
    return this._nodeOptions;
  }
  public set nodeOptions(value: RequestOptions) {
    this._nodeOptions = value;
  }

  private _updateOptionURL(url: string) {
    const res = { ...this._nodeOptions };
    res.url = res.url.toString().replace(/\/?$/, "/") + url.replace(/^\/+/, ""); // force trailing slash, remove leading slashes

    return res;
  }
}
