import { assert, HexString } from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import { MockChain } from "../mockChain";
import { MockChainParty } from "./mockChainParty";

export class NonKeyedMockChainParty extends MockChainParty {
  constructor(chain: MockChain, ergoTree: HexString, name?: string) {
    assert(
      typeof ergoTree === "string",
      "A non-keyed party needs a valid ErgoTree to be instantiated."
    );

    const address = ErgoAddress.fromErgoTree(ergoTree);
    super(chain, address, name);
  }
}
