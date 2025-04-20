import { blake2b256, hex } from "@fleet-sdk/crypto";
import { describe, expect, it, test } from "vitest";
import { unsignedTransactionVectors } from "../_test-vectors/transactionVectors";
import { serializeTransaction } from "./transactionSerializer";
import signedTransactionVectors from "../_test-vectors/signedTransactions.json";
import { isEmpty } from "@fleet-sdk/common";

describe("Transaction serializer", () => {
  test.each(unsignedTransactionVectors)(
    "Should serialize unsigned transaction [$name]",
    (tv) => {
      const bytes = serializeTransaction(tv.json).toBytes();

      expect(hex.encode(bytes)).toBe(tv.hex);
      expect(hex.encode(blake2b256(bytes))).toBe(tv.hash);
    }
  );

  test.each(signedTransactionVectors)("should serialize signed transaction", (tv) => {
    expect(hex.encode(serializeTransaction(tv.json).toBytes())).toBe(tv.hex);
  });

  it("should serialize if input extension is undefined", () => {
    const tv = unsignedTransactionVectors[0];
    const tx = structuredClone(tv.json);

    for (const input of tx.inputs) {
      if (isEmpty(input.extension)) {
        // @ts-expect-error intentionally setting extension to undefined
        input.extension = undefined;
      }
    }

    expect(hex.encode(serializeTransaction(tx).toBytes())).toEqual(tv.hex);
  });
});
