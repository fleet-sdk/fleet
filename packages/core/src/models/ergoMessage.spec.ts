import { Network } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { describe, expect, it, test } from "vitest";
import {
  ErgoMessage,
  type ErgoMessageOptions,
  MessageType
} from "./ergoMessage";

const testVectors = [
  {
    type: MessageType.Binary,
    data: "deadbeef",
    hash: "f3e925002fed7cc0ded46842569eb5c90c910c091d8d04a1bdf96e0db719fd91",
    encoded: {
      mainnet: "AdQ5WCyibKZvCFkCAShhic6Z6cP3sG3KFp5ZSdb7gDfBL6b4Sy",
      testnet: "hjJuDPVMQ9C5KZ2hSNgxrCVCvTsT8k3uUwoTqdw2AKs5CDZYKU"
    }
  },
  {
    type: MessageType.Binary,
    data: Uint8Array.from([0xca, 0xfe, 0xba, 0xbe]),
    hash: "892259bf708da0ec6584c7acd35cdda1673c69d884deafb3f4a71468b92765fe",
    encoded: {
      mainnet: "9pNcdQcTdkEkDZw27ej3omAS6BXCwtTDwBtGyAn1wRzEhEQMB9",
      testnet: "gvHSLb86SZruLsDXPaiJwMZ5v31cDNTpAKcBNB7vRYC8jpA3T5"
    }
  },
  {
    type: MessageType.String,
    data: "hello world",
    hash: "256c83b297114d201b30179f3f0ef0cace9783622da5974326b436178aeef610",
    encoded: {
      mainnet: "94TecijXkL6bZMtAqMjDpCGhuMuAK4c5KVvaq8dtxcDpMXjX6P",
      testnet: "gANUKuFAZ9ikgfAg7HiUwnfMjDPZaYcfYdeVE8yoSiRiNcfUGf"
    }
  },
  {
    type: MessageType.Json,
    data: { foo: "bar" },
    hash: "a983310b11d201f3483f27857e4c54dc2c82991b9bd702c7d3ed69530471512f",
    encoded: {
      mainnet: "A4dg6hh8QVypCj6gu17ufkPE9Rq1dx6drurLQGnVNJBYb2FBTc",
      testnet: "hAYVotCmDKbyL2PCAw7AoLmsyHKQuS7E63aEoH8PrQPSVHZ9gJ"
    }
  }
];

describe("ErgoMessage construction", () => {
  test.each(testVectors)("Should construct from data", (tv) => {
    const message = ErgoMessage.fromData(tv.data);

    expect(message.type).to.be.equal(tv.type);
    expect(message.network).to.be.equal(
      Network.Mainnet,
      "Should default to Mainnet"
    );
    if (tv.type === MessageType.Binary && typeof tv.data === "string") {
      expect(hex.encode(message.getData() as Uint8Array)).to.be.equal(tv.data);
    } else {
      expect(message.getData()).to.be.deep.equal(tv.data);
    }
    expect(tv.hash).to.be.equal(hex.encode(message.hash));
    expect(message.verify(tv.data)).to.be.true;
    expect(message.encode()).to.be.equal(tv.encoded.mainnet);

    message.setNetwork(Network.Testnet);
    expect(message.network).to.be.equal(Network.Testnet);
  });

  test.each(testVectors)("Should construct from mainnet encoded hash", (tv) => {
    const message = ErgoMessage.decode(tv.encoded.mainnet);

    expect(message.type).to.be.equal(MessageType.Hash);
    expect(message.network).to.be.equal(Network.Mainnet);

    expect(message.getData()).to.be.undefined;
    expect(tv.hash).to.be.equal(hex.encode(message.hash));

    expect(message.verify(tv.data)).to.be.true;
    expect(message.encode()).to.be.equal(tv.encoded.mainnet);
  });

  test.each(testVectors)("Should construct from testnet encoded hash", (tv) => {
    const message = ErgoMessage.decode(tv.encoded.testnet);

    expect(message.type).to.be.equal(MessageType.Hash);
    expect(message.network).to.be.equal(Network.Testnet);

    expect(message.getData()).to.be.undefined;
    expect(tv.hash).to.be.equal(hex.encode(message.hash));

    expect(message.verify(tv.data)).to.be.true;
    expect(message.encode()).to.be.equal(tv.encoded.testnet);
  });

  test.each(testVectors)("Encoding roundtrip", (tv) => {
    const fromData = ErgoMessage.decode(ErgoMessage.fromData(tv.data).encode());
    expect(fromData.encode(Network.Mainnet)).to.be.equal(tv.encoded.mainnet);
    expect(fromData.encode(Network.Testnet)).to.be.equal(tv.encoded.testnet);

    const fromHash = ErgoMessage.decode(
      ErgoMessage.fromBase58(tv.encoded.mainnet).encode()
    );
    expect(fromHash.toString()).to.be.equal(tv.encoded.mainnet);
    expect(fromHash.toString(Network.Testnet)).to.be.equal(tv.encoded.testnet);
  });

  it("Should throw when nor data or hash is provided", () => {
    expect(() => new ErgoMessage({} as unknown as ErgoMessageOptions)).to.throw(
      "Either hash or message data must be provided"
    );
  });

  it("Should throw when invalid encoded message hash", () => {
    const invalidChecksum =
      "AdQ5WCyibKZvCFkCAShhic5Z6cP3sG3KFp5ZSdb7gDfBL6b4Sy";
    expect(() => ErgoMessage.decode(invalidChecksum)).to.throw(
      "Invalid encoded message hash"
    );

    const invalidType = "9et2sWchC9o4894aaVDzcgfCyDoBV8nNvtnk5hSW3fzBbSwoX31"; // p2pk
    expect(() => ErgoMessage.decode(invalidType)).to.throw(
      "Invalid message type"
    );
  });
});

describe("Serialization", () => {
  it("Should serialize to bytes", () => {
    const message = ErgoMessage.fromData("hello world");
    const bytes = message.serialize().toBytes();

    expect(bytes).to.be.deep.equal(
      Uint8Array.from([0x0, message.network, ...message.hash])
    );
  });
});
