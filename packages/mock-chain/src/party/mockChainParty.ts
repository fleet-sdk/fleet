import {
  type Amount,
  type BoxCandidate,
  type NonMandatoryRegisters,
  type OneOrMore,
  type TokenAmount,
  utxoSum
} from "@fleet-sdk/common";
import { type Box, type ErgoAddress, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { stringifyBalance } from "../balancePrinting";
import type { MockChain } from "../mockChain";
import { MockUTxOCollection } from "../mockUtxoCollection";

export type MockUTxOInput =
  | OneOrMore<BoxCandidate<Amount>>
  | OneOrMore<Box<Amount>>;

export type AddBalance = {
  nanoergs?: Amount;
  tokens?: TokenAmount<Amount>[];
};

export type PartyBalance = {
  nanoergs: bigint;
  tokens: TokenAmount<bigint>[];
};

export abstract class MockChainParty {
  private readonly _name?: string;
  private readonly _utxos: MockUTxOCollection;
  private readonly _address: ErgoAddress;
  private readonly _ergoTree: string;
  private readonly _chain: MockChain;

  constructor(chain: MockChain, address: ErgoAddress, name?: string) {
    this._chain = chain;
    this._address = address;
    this._name = name;

    this._ergoTree = this._address.ergoTree;
    this._utxos = new MockUTxOCollection();
  }

  get address(): ErgoAddress {
    return this._address;
  }

  get name(): string {
    return this._name || this._address.encode();
  }

  get utxos(): MockUTxOCollection {
    return this._utxos;
  }

  get ergoTree(): string {
    return this._ergoTree;
  }

  get chain(): MockChain {
    return this._chain;
  }

  get balance(): PartyBalance {
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

  addBalance(
    balance: AddBalance,
    additionalRegisters?: NonMandatoryRegisters
  ): MockChainParty {
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
  withBalance(
    balance: AddBalance,
    additionalRegisters?: NonMandatoryRegisters
  ): MockChainParty {
    return this.addBalance(balance, additionalRegisters);
  }

  toString(width = 50): string {
    return stringifyBalance(
      this.balance,
      this.name,
      width,
      this._chain.assetsMetadata
    );
  }
}
