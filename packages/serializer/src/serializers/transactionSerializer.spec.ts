import { blake2b256, hex } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import { unsignedTransactionVectors } from "../_test-vectors/transactionVectors";
import { serializeTransaction } from "./transactionSerializer";

describe("Transaction serializer", () => {
  it.each(unsignedTransactionVectors)("Should serialize [$name]", (tv) => {
    const bytes = serializeTransaction(tv.json).toBytes();

    expect(hex.encode(bytes)).toBe(tv.hex);
    expect(hex.encode(blake2b256(bytes))).toBe(tv.hash);
  });
});
