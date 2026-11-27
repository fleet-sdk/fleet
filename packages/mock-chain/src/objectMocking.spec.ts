import { type BoxCandidate, hasDuplicatesBy } from "@fleet-sdk/common";
import { ErgoBox, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { hex, randomBytes } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import { mockBlockchainStateContext, mockHeaders, mockUTxO } from "./objectMocking";

describe("mockUTxO()", () => {
  it("Should set default values when omitted", () => {
    const ergoTree = "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d";

    const utxo = mockUTxO({ ergoTree });

    expect(utxo.boxId).to.have.length(64);
    expect(utxo.value).to.be.equal(SAFE_MIN_BOX_VALUE);
    expect(utxo.ergoTree).to.be.equal(ergoTree);
    expect(utxo.assets).to.be.empty;
    expect(utxo.creationHeight).to.be.equal(849741);
    expect(utxo.additionalRegisters).to.be.empty;

    expect(utxo.transactionId).to.have.length(64);
    expect(utxo.index).to.be.equal(0);

    expect(ErgoBox.validate(utxo)).to.be.true;
  });

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

    const utxo = mockUTxO(candidate);

    expect(utxo.boxId).to.have.length(64);
    expect(utxo.value).to.be.equal(candidate.value);
    expect(utxo.ergoTree).to.be.equal(candidate.ergoTree);
    expect(utxo.assets).to.be.deep.equal(candidate.assets);
    expect(utxo.creationHeight).to.be.equal(candidate.creationHeight);
    expect(utxo.additionalRegisters).to.be.deep.equal(candidate.additionalRegisters);

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
    expect(headers[0].height).to.be.equal(10);
    expect(headers[headers.length - 1].height).to.be.equal(1);

    for (let i = 0; i < headers.length - 1; i++) {
      expect(headers[i].height).to.be.greaterThan(0);
      expect(headers[i].parentId).to.be.equal(headers[i + 1].id);
      expect(headers[i].height).to.be.equal(headers[i + 1].height + 1);
      expect(headers[i].timestamp - headers[i + 1].timestamp).to.be.equal(120000); // 2 min
      expect(headers[i].version).to.be.equal(3);
    }
    expect(headers[headers.length - 1].version).to.be.equal(3);
  });

  it("Should mock n headers with parameters", () => {
    const params = {
      version: 10,
      fromHeight: 55,
      fromTimestamp: new Date().getTime(),
      parentId: hex.encode(randomBytes(32))
    };
    const headers = mockHeaders(10, params);

    expect(headers).to.have.length(10);
    expect(hasDuplicatesBy(headers, (x) => x.id)).to.be.false;
    expect(hasDuplicatesBy(headers, (x) => x.parentId)).to.be.false;

    expect(headers[0].version).to.be.equal(params.version);
    expect(headers[0].height).to.be.equal(params.fromHeight);
    expect(headers[0].timestamp).to.be.equal(params.fromTimestamp);
    expect(headers[headers.length - 1].parentId).to.be.equal(params.parentId);
    expect(headers[headers.length - 1].height).to.be.equal(params.fromHeight - 9);

    for (let i = 0; i < headers.length - 1; i++) {
      expect(headers[i].parentId).to.be.equal(headers[i + 1].id);
      expect(headers[i].height).to.be.equal(headers[i + 1].height + 1);
      expect(headers[i].timestamp - headers[i + 1].timestamp).to.be.equal(120000); // 2 min
      expect(headers[i].version).to.be.equal(params.version);
    }
  });
});

describe("mockBlockchainStateContext()", () => {
  it("Should build descending headers and matching preHeader with default options", () => {
    const context = mockBlockchainStateContext();

    expect(context.sigmaLastHeaders).to.have.length(10);
    expect(context.sigmaPreHeader.height).to.be.equal(11);
    expect(context.sigmaPreHeader.parentId).to.be.equal(context.sigmaLastHeaders[0].id);
    expect(context.previousStateDigest).to.be.equal(context.sigmaLastHeaders[0].stateRoot.digest);
    expect(context.sigmaLastHeaders[0].height).to.be.equal(10);
    expect(context.sigmaLastHeaders[9].height).to.be.equal(1);
    expect(context.sigmaPreHeader.timestamp - context.sigmaLastHeaders[0].timestamp).to.be.equal(
      120000n
    );
  });

  it("Should anchor preHeader to fromHeight and fromTimestamp with prior confirmed headers", () => {
    const fromHeight = 1000;
    const fromTimestamp = 1_700_000_000_000;
    const context = mockBlockchainStateContext({
      headers: { quantity: 10, fromHeight, fromTimestamp }
    });

    expect(context.sigmaPreHeader.height).to.be.equal(fromHeight);
    expect(context.sigmaPreHeader.timestamp).to.be.equal(BigInt(fromTimestamp));
    expect(context.sigmaPreHeader.parentId).to.be.equal(context.sigmaLastHeaders[0].id);
    expect(context.previousStateDigest).to.be.equal(context.sigmaLastHeaders[0].stateRoot.digest);

    for (let i = 0; i < context.sigmaLastHeaders.length; i++) {
      const header = context.sigmaLastHeaders[i];
      expect(header.height).to.be.equal(fromHeight - i - 1);
      expect(header.timestamp).to.be.equal(BigInt(fromTimestamp - (i + 1) * 120_000));
      if (i < context.sigmaLastHeaders.length - 1) {
        expect(header.parentId).to.be.equal(context.sigmaLastHeaders[i + 1].id);
      }
    }
  });
});
