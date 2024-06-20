import { BoxCandidate, hasDuplicatesBy } from "@fleet-sdk/common";
import { ErgoBox, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { hex, randomBytes } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import { mockHeaders, mockUTxO } from "./objectMocking";

describe("mockUTxO()", () => {
  it("Should set default values when omitted", () => {
    const ergoTree =
      "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d";

    const utxo = mockUTxO({ ergoTree });

    expect(utxo.boxId).to.have.length(64);
    expect(utxo.value).to.be.equal(SAFE_MIN_BOX_VALUE);
    expect(utxo.ergoTree).to.be.equal(ergoTree);
    expect(utxo.assets).to.be.empty;
    expect(utxo.creationHeight).to.be.equal(0);
    expect(utxo.additionalRegisters).to.be.empty;

    expect(utxo.transactionId).to.have.length(64);
    expect(utxo.index).to.be.equal(0);

    expect(ErgoBox.validate(utxo)).to.be.true;
  });

  it("Should transform a candidate in a valid UTxO", () => {
    const candidate: BoxCandidate<bigint> = {
      ergoTree:
        "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
      creationHeight: 804138,
      value: 1000000n,
      assets: [
        {
          tokenId:
            "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 10000n
        }
      ],
      additionalRegisters: {}
    };

    const utxo = mockUTxO(candidate);

    expect(utxo.boxId).to.have.length(64);
    expect(utxo.value).to.be.equal(candidate.value);
    expect(utxo.ergoTree).to.be.equal(candidate.ergoTree);
    expect(utxo.assets).to.be.deep.equal(candidate.assets);
    expect(utxo.creationHeight).to.be.equal(candidate.creationHeight);
    expect(utxo.additionalRegisters).to.be.deep.equal(
      candidate.additionalRegisters
    );

    expect(utxo.transactionId).to.have.length(64);
    expect(utxo.index).to.be.equal(0);

    expect(ErgoBox.validate(utxo)).to.be.true;
  });
});

describe("mockHeaders()", () => {
  it("Should mock n headers with default values", () => {
    const headers = mockHeaders(10);

    expect(headers).to.have.length(10);
    expect(hasDuplicatesBy(headers, (x) => x.id)).to.be.false;
    expect(hasDuplicatesBy(headers, (x) => x.parentId)).to.be.false;

    for (let i = 0; i < headers.length - 1; i++) {
      expect(headers[i].height).to.be.greaterThan(0);
      expect(headers[i].parentId).to.be.equal(headers[i + 1].id);
      expect(headers[i].height).to.be.equal(headers[i + 1].height - 1);
      expect(headers[i + 1].timestamp - headers[i].timestamp).to.be.equal(
        120000
      ); // 2 min
      expect(headers[i].version).to.be.equal(3);
    }
  });

  it("Should mock n headers with with parameters", () => {
    const params = {
      version: 10,
      fromHeight: 55,
      fromTimeStamp: new Date().getTime(),
      parentId: hex.encode(randomBytes(32))
    };
    const headers = mockHeaders(10, params);

    expect(headers).to.have.length(10);
    expect(hasDuplicatesBy(headers, (x) => x.id)).to.be.false;
    expect(hasDuplicatesBy(headers, (x) => x.parentId)).to.be.false;

    for (let i = 0; i < headers.length - 1; i++) {
      if (i == headers.length) {
        expect(headers[i].version).to.be.equal(params.version);
        expect(headers[i].height).to.be.equal(params.fromHeight);
        expect(headers[i].timestamp).to.be.equal(params.fromTimeStamp);
      } else {
        expect(headers[i].parentId).to.be.equal(headers[i + 1].id);
        expect(headers[i].height).to.be.equal(headers[i + 1].height - 1);
        expect(headers[i + 1].timestamp - headers[i].timestamp).to.be.equal(
          120000
        ); // 2 min
        expect(headers[i].version).to.be.equal(params.version);
      }
    }
  });
});
