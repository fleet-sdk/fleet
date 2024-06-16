import { Network } from "@fleet-sdk/common";
import { blake2b256, hex, utf8 } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import { ErgoMessage, MessageType } from "./ergoMessage";

describe("ErgoMessage construction", () => {
  it("Should construct from data", () => {
    const binaryMsgData = "deadbeef";
    const binaryMessage = ErgoMessage.fromData(binaryMsgData);
    expect(binaryMessage.type).to.be.equal(MessageType.Binary);
    expect(binaryMessage.network).to.be.equal(Network.Mainnet, "Should default to Mainnet");
    expect(binaryMessage.getData()).to.be.deep.equal(hex.decode(binaryMsgData));
    expect(binaryMessage.hash).to.be.deep.equal(blake2b256(binaryMsgData));

    const stringMsgData = "hello world";
    const stringMessage = ErgoMessage.fromData(stringMsgData, Network.Testnet);
    expect(stringMessage.type).to.be.equal(MessageType.String);
    expect(stringMessage.network).to.be.equal(Network.Testnet);
    expect(stringMessage.getData()).to.be.equal(stringMsgData);
    expect(stringMessage.hash).to.be.deep.equal(blake2b256(utf8.decode(stringMsgData)));

    const jsonMsgData = { foo: "bar" };
    const jsonMessage = ErgoMessage.fromData(jsonMsgData, Network.Mainnet);
    expect(jsonMessage.type).to.be.equal(MessageType.Json);
    expect(jsonMessage.network).to.be.equal(Network.Mainnet);
    expect(jsonMessage.getData()).to.be.deep.equal(jsonMsgData);
    expect(jsonMessage.hash).to.be.deep.equal(blake2b256(utf8.decode(JSON.stringify(jsonMsgData))));
  });
});
