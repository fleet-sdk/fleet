import { SignedTransaction } from "@fleet-sdk/common";
import { describe, expect, it } from "vitest";
import { castSignedTxToGql } from "./cast";
import { SignedTransaction as gqlSignedTransaction } from "@ergo-graphql/types";

describe("Graphql cast function", () => {
  it("Should cast SignedTransaction to gqlSignedTransaction", () => {
    const signed: SignedTransaction = {
      id: "123",
      inputs: [
        {
          boxId: "123",
          spendingProof: {
            proofBytes: "123",
            extension: ""
          }
        }
      ],
      dataInputs: [
        {
          boxId: "123"
        }
      ],
      outputs: [
        {
          boxId: "456",
          value: BigInt("123"),
          ergoTree: "tree",
          creationHeight: 0,
          assets: [
            {
              tokenId: "789",
              amount: BigInt("123")
            }
          ],
          additionalRegisters: {},
          index: 0,
          transactionId: "555"
        }
      ]
    };
    const expected: gqlSignedTransaction = {
      id: "123",
      inputs: [
        {
          boxId: "123",
          spendingProof: {
            proofBytes: "123",
            extension: ""
          },

        },
      ],
      dataInputs: [
        {
          boxId: "123"
        }
      ],
      outputs: [
        {
          boxId: "456",
          value: "123",
          ergoTree: "tree",
          creationHeight: 0,
          assets: [
            {
              tokenId: "789",
              amount: "123"
            }
          ],
          additionalRegisters: {},
        }
      ]
    };

    const gqlSigned = castSignedTxToGql(signed);
    expect(gqlSigned).to.deep.equal(expected);
    expect(1).to.be.equal(1);
  });
});
