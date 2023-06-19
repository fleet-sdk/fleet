import { Box, ErgoAddress } from "@fleet-sdk/core";
import { randomBytes } from "@noble/hashes/utils";
import { ErgoHDKey } from "../../wallet/src";

export class MockChainParty {
  private readonly _key: ErgoHDKey;
  private readonly _name: string;
  private readonly _utxos: Box<bigint>[];

  public get key(): ErgoHDKey {
    return this._key;
  }

  public get address(): ErgoAddress {
    return this._key.address;
  }

  public get name(): string {
    return this._name;
  }

  public get utxos(): Box<bigint>[] {
    return this._utxos;
  }

  constructor(name: string) {
    this._name = name;
    this._utxos = [];

    const seed = randomBytes(32);
    this._key = ErgoHDKey.fromMasterSeed(seed);
  }
}
