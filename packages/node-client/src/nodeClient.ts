import {
  Amount,
  BlockHeader,
  Box,
  BoxId,
  NewToken,
  NonMandatoryRegisters,
  SignedTransaction,
  SortingDirection,
  TokenId,
  TransactionId
} from "@fleet-sdk/common";
import { ErgoBox } from "@fleet-sdk/core";
import { get, post, RequestOptions } from "./utils/rest";

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
    const res = await this._getRequest("blockchain/indexedHeight");

    return parseInt(res.fullHeight);
  }

  /**
   * Get the current node indexed height
   * @returns number
   */
  public async getIndexedHeight(): Promise<number> {
    const res = await this._getRequest("blockchain/indexedHeight");

    return parseInt(res.indexedHeight);
  }

  /**
   * Get a transaction by transactionId
   * @param txId
   * @returns SignedTransaction
   */
  public async getTransactionByTransactionId(txId: string): Promise<SignedTransaction> {
    const output: SignedTransaction = await this._getRequest(`blockchain/transaction/byId/${txId}`);

    return output;
  }

  /**
   * Get a transaction by index
   * @param index
   * @returns SignedTransaction
   */
  public async getTransactionByIndex(index: number): Promise<SignedTransaction> {
    const output: SignedTransaction = await this._getRequest(
      `blockchain/transaction/byIndex/${index}`
    );

    return output;
  }

  /**
   * Get the historical transactions for an address (limit max 100)
   * @param addr
   * @param limit
   * @param offset
   * @returns Array<SignedTransaction>
   */
  public async getTransactionsByAddress(
    addr: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Array<SignedTransaction>> {
    const res = await this._postRequest(
      `blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`,
      addr
    );
    const output: Array<SignedTransaction> = res.items;

    return output;
  }

  /**
   * Check if an address was already used
   * @param addr
   * @returns boolean, true if the address has one or more transactions
   */
  public async addressHasTransactions(addr: string): Promise<boolean> {
    const txList = await this.getTransactionsByAddress(addr, 1);
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
  public async getBoxByBoxId(boxId: string): Promise<ErgoBox> {
    const res = await this._getRequest(`blockchain/box/byId/${boxId}`);
    const ergoBox = new ErgoBox(res);

    return ergoBox;
  }

  /**
   * Get an ergo box by index
   * @param index
   * @returns ErgoBox
   */
  public async getBoxByIndex(index: number): Promise<ErgoBox> {
    const res = await this._getRequest(`blockchain/box/byIndex/${index}`);
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
    address: string,
    limit: number = 5,
    offset: number = 0
  ): Promise<Array<ErgoBox>> {
    const res = await this._postRequest(
      `blockchain/box/byAddress?offset=${offset}&limit=${limit}`,
      address
    );
    const boxes: Array<ErgoBox> = res.map(
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
    ergotree: string,
    limit: number = 5,
    offset: number = 0
  ): Promise<Array<ErgoBox>> {
    const res = await this._postRequest(
      `blockchain/box/byAddress?offset=${offset}&limit=${limit}`,
      ergotree
    );
    const boxes: Array<ErgoBox> = res.map(
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
    address: string,
    limit: number = 5,
    offset: number = 0,
    sort: SortingDirection = "desc",
    includeUnconfirmed: boolean = false
  ): Promise<Array<ErgoBox>> {
    const res = await this._postRequest(
      `blockchain/box/unspent/byAddress?offset=${offset}&limit=${limit}&sortDirection=${sort}&includeUnconfirmed=${includeUnconfirmed}`,
      address
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
    ergotree: string,
    limit: number = 5,
    offset: number = 0,
    sort: SortingDirection = "desc",
    includeUnconfirmed: boolean = false
  ): Promise<Array<ErgoBox>> {
    const res = await this._postRequest(
      `blockchain/box/unspent/byAddress?offset=${offset}&limit=${limit}&sortDirection=${sort}&includeUnconfirmed=${includeUnconfirmed}`,
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
    tokenId: string,
    limit: number = 5,
    offset: number = 0
  ): Promise<Array<ErgoBox>> {
    const res = await this._getRequest(
      `/blockchain/box/unspent/byTokenId/${tokenId}?offset=${offset}&limit=${limit}`
    );
    const boxes: Array<ErgoBox> = res.map(
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
    tokenId: string,
    limit: number = 5,
    offset: number = 0,
    sort: SortingDirection = "desc",
    includeUnconfirmed: boolean = false
  ): Promise<Array<ErgoBox>> {
    const res = await this._getRequest(
      `/blockchain/box/unspent/byTokenId/${tokenId}?offset=${offset}&limit=${limit}&sortDirection=${sort}&includeUnconfirmed=${includeUnconfirmed}`
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
    address: string,
    confirmed: boolean = true
  ): Promise<BalanceInfo> {
    const res = await this._postRequest(`blockchain/balance`, address);
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
    const res = await this._getRequest(`blocks/lastHeaders/${count}`);

    return res;
  }

  /**
   * Get the information about a token
   * @param tokenId
   * @returns TokenInfo
   */
  public async getTokenInfo(tokenId: TokenId): Promise<TokenInfo> {
    const tokenInfo: TokenInfo = await this._getRequest(`blockchain/token/byId/${tokenId}`);

    return tokenInfo;
  }

  /**
   * Get the information about the connected ergo node
   * @returns NodeInfo
   */
  public async getNodeInfo() {
    const tokenInfo = await this._getRequest(`info`);

    return tokenInfo;
  }

  /**
   * Compile an ergoscript string to an ergo address
   * @param script
   * @returns NodeCompilerOutput
   */
  public async compileErgoscript(script: string): Promise<NodeCompilerOutput> {
    const res = await this._postRequest(`script/p2sAddress`, { source: script });
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
  public async postTx(tx: SignedTransaction): Promise<NodeSendTransactionOutput> {
    const res = await this._postRequest("transactions", tx);
    if (res.error) {
      const out: NodeErrorOutput = res;

      return out;
    } else {
      const out = { transactionId: res };

      return out;
    }
  }

  public get nodeOptions(): RequestOptions {
    return this._nodeOptions;
  }
  public set nodeOptions(value: RequestOptions) {
    this._nodeOptions = value;
  }

  private _updateOptionURL(url: string) {
    const res = { ...this._nodeOptions };
    res.url = res.url + url;

    return res;
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private async _getRequest(url: string): Promise<any> {
    const res = await get(this._updateOptionURL(url));

    return res;
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private async _postRequest(url: string, body: any = {}): Promise<any> {
    const res = await post(body, this._updateOptionURL(url));

    return res;
  }
}
