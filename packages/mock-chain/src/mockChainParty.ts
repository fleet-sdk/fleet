import {
  Amount,
  BoxCandidate,
  BoxSummary,
  NonMandatoryRegisters,
  OneOrMore,
  TokenAmount,
  utxoSum
} from "@fleet-sdk/common";
import { Box, ErgoAddress, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { randomBytes } from "@noble/hashes/utils";
import { MockChain } from "./mockChain";
import { MockUTxOCollection } from "./mockUtxoCollection";

export type MockUTxOInput = OneOrMore<BoxCandidate<Amount>> | OneOrMore<Box<Amount>>;

export type AddBalance = {
  nanoergs?: Amount;
  tokens?: TokenAmount<Amount>[];
};

export type PartyBalance = {
  nanoergs: Amount;
  tokens: TokenAmount<Amount>[];
};

export type MockChainPartyParams = {
  name?: string;
  ergoTree: string;
};

export class MockChainParty {
  private readonly _key?: ErgoHDKey;
  private readonly _name?: string;
  private readonly _utxos: MockUTxOCollection;
  private readonly _address: ErgoAddress;
  private readonly _ergoTree: string;
  private readonly _chain: MockChain;

  constructor(chain: MockChain);
  constructor(chain: MockChain, name?: string);
  constructor(chain: MockChain, params?: MockChainPartyParams);
  constructor(chain: MockChain, nameOrParams?: string | MockChainPartyParams);
  constructor(chain: MockChain, nameOrParams?: string | MockChainPartyParams) {
    if (!nameOrParams || typeof nameOrParams === "string") {
      this._name = nameOrParams;
      const seed = randomBytes(32);
      this._key = ErgoHDKey.fromMasterSeed(seed);
      this._address = this._key.address;
    } else {
      if (!nameOrParams.ergoTree) {
        throw new Error("A non-keyed party needs a valid ErgoTree to be instantiated.");
      }

      this._name = nameOrParams.name;
      this._address = ErgoAddress.fromErgoTree(nameOrParams.ergoTree);
    }

    this._chain = chain;
    this._ergoTree = this._address.ergoTree;
    this._utxos = new MockUTxOCollection();
  }

  public get key(): ErgoHDKey | undefined {
    return this._key;
  }

  public get address(): ErgoAddress {
    return this._address;
  }

  public get name(): string {
    return this._name || this._address.encode();
  }

  public get utxos(): MockUTxOCollection {
    return this._utxos;
  }

  public get ergoTree(): string {
    return this._ergoTree;
  }

  public get chain(): MockChain {
    return this._chain;
  }

  public get balance(): PartyBalance {
    const summary = utxoSum(this._utxos.toArray());

    return { nanoergs: summary.nanoErgs, tokens: summary.tokens };
  }

  addUTxOs(utxos: MockUTxOInput): MockChainParty {
    this._utxos.add(utxos);

    return this;
  }

  /**
   * Syntax sugar for `addUTxOs`
   * @param utxos
   * @returns
   */
  withUTxOs(utxos: MockUTxOInput): MockChainParty {
    return this.addUTxOs(utxos);
  }

  addBalance(balance: AddBalance, additionalRegisters?: NonMandatoryRegisters): MockChainParty {
    this.addUTxOs({
      value: balance.nanoergs || SAFE_MIN_BOX_VALUE,
      assets: balance.tokens || [],
      ergoTree: this._ergoTree,
      creationHeight: this._chain.height,
      additionalRegisters: additionalRegisters || {}
    });

    return this;
  }

  /**
   * Syntax sugar for `addBalance`
   * @param utxos
   * @returns
   */
  withBalance(balance: AddBalance, additionalRegisters?: NonMandatoryRegisters): MockChainParty {
    return this.addBalance(balance, additionalRegisters);
  }
}
