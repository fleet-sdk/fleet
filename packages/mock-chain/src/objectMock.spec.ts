import { BoxCandidate, hasDuplicatesBy } from "@fleet-sdk/common";
import { ErgoBox } from "@fleet-sdk/core";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { describe, expect, it } from "vitest";
import { candidateToUTxO, mockHeaders } from "./objectMock";

describe("candidateToUTxO()", () => {
  it("Should transform a candidate in a valid UTxO", () => {
    const candidate: BoxCandidate<bigint> = {
      ergoTree: "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
      creationHeight: 804138,
      value: 1000000n,
      assets: [
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 10000n
        }
      ],
      additionalRegisters: {}
    };

    const utxo = candidateToUTxO(candidate);

    expect(utxo.boxId).not.to.be.undefined;
    expect(utxo.transactionId).not.to.be.undefined;
    expect(utxo.index).not.to.be.undefined;

    expect(ErgoBox.validate(utxo)).to.be.true;
  });
});

describe("mockHeaders()", () => {
  it("Should mock n headers with default values", () => {
    const headers = mockHeaders(10);

    expect(headers).to.have.length(10);
    expect(hasDuplicatesBy(headers, (x) => x.id)).to.be.false;
    expect(hasDuplicatesBy(headers, (x) => x.parentId)).to.be.false;

    for (let i = headers.length - 1; i > 0; i--) {
      expect(headers[i].height).to.be.greaterThan(0);
      expect(headers[i].parentId).to.be.equal(headers[i - 1].id);
      expect(headers[i].height).to.be.equal(headers[i - 1].height - 1);
      expect(headers[i - 1].timestamp - headers[i].timestamp).to.be.equal(120000); // 2 min
      expect(headers[i].version).to.be.equal(3);
    }
  });

  it("Should mock n headers with with parameters", () => {
    const params = {
      version: 10,
      fromHeight: 55,
      fromTimeStamp: new Date().getTime(),
      parentId: bytesToHex(randomBytes(32))
    };
    const headers = mockHeaders(10, params);

    expect(headers).to.have.length(10);
    expect(hasDuplicatesBy(headers, (x) => x.id)).to.be.false;
    expect(hasDuplicatesBy(headers, (x) => x.parentId)).to.be.false;

    for (let i = headers.length - 1; i > 0; i--) {
      if (i == headers.length) {
        expect(headers[i].version).to.be.equal(params.version);
        expect(headers[i].height).to.be.equal(params.fromHeight);
        expect(headers[i].timestamp).to.be.equal(params.fromTimeStamp);
      } else {
        expect(headers[i].parentId).to.be.equal(headers[i - 1].id);
        expect(headers[i].height).to.be.equal(headers[i - 1].height - 1);
        expect(headers[i - 1].timestamp - headers[i].timestamp).to.be.equal(120000); // 2 min
        expect(headers[i].version).to.be.equal(params.version);
      }
    }
  });
});
