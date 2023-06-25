import { isDefined } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { execute } from "./executor";
import { MockChainParty, MockChainPartyParams } from "./mockChainParty";
import { mockHeaders } from "./objectMock";

const BLOCK_TIME_MS = 120000;

export type TransactionExecutionParams = {
  signers?: MockChainParty[];
  throw?: boolean;
};

export type MockChainParams = {
  height?: number;
  timestamp?: number;
};

export class MockChain {
  private readonly _parties: MockChainParty[];
  private _height: number;
  private _timeStamp: number;

  constructor(height?: number);
  constructor(params?: MockChainParams);
  constructor(heightOrParams?: number | MockChainParams) {
    const params =
      !heightOrParams || typeof heightOrParams === "number"
        ? { height: heightOrParams || 0 }
        : heightOrParams;

    this._height = params.height || 0;
    this._timeStamp = params.timestamp || new Date().getTime();
    this._parties = [];
  }

  get height(): number {
    return this._height;
  }

  get timestamp(): number {
    return this._timeStamp;
  }

  get parties(): MockChainParty[] {
    return this._parties;
  }

  newBlock() {
    this.newBlocks(1);
  }

  newBlocks(count: number) {
    this._height += count;
    this._timeStamp += BLOCK_TIME_MS * count;
  }

  newParty(name?: string): MockChainParty;
  newParty(params?: MockChainPartyParams): MockChainParty;
  newParty(nameOrParams?: string | MockChainPartyParams): MockChainParty {
    const party = new MockChainParty(this, nameOrParams);
    this._parties.push(party);

    return party;
  }

  execute(
    unsignedTransaction: ErgoUnsignedTransaction,
    params?: TransactionExecutionParams
  ): boolean {
    const keys = (params?.signers || this._parties)
      .map((party) => party.key)
      .filter((key): key is ErgoHDKey => isDefined(key));

    const headers = mockHeaders(10, {
      fromHeight: this._height,
      fromTimeStamp: this._timeStamp
    });

    const result = execute(unsignedTransaction, keys, headers);

    if (!result.success) {
      if (params?.throw === true) {
        throw new Error(result.reason);
      }

      return false;
    }

    const { inputs, outputs } = unsignedTransaction.toPlainObject();
    for (const party of this._parties) {
      for (let i = inputs.length - 1; i >= 0; i--) {
        if (party.utxos.exists(inputs[i].boxId)) {
          party.utxos.remove(inputs[i].boxId);
          inputs.splice(i, 1);

          break;
        }
      }

      for (let i = outputs.length - 1; i >= 0; i--) {
        if (party.ergoTree === outputs[i].ergoTree) {
          party.utxos.add(outputs[i]);
          outputs.splice(i, 1);
        }
      }
    }
    this.newBlock();

    return true;
  }
}
