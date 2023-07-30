import { randomBytes } from "@fleet-sdk/crypto";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { MockChain } from "../mockChain";
import { MockChainParty } from "./mockChainParty";

export class KeyedMockChainParty extends MockChainParty {
  private readonly _key: ErgoHDKey;

  constructor(chain: MockChain, name?: string) {
    const seed = randomBytes(32);
    const key = ErgoHDKey.fromMasterSeed(seed);
    super(chain, key.address, name);

    this._key = key;
  }

  get key(): ErgoHDKey {
    return this._key;
  }
}
