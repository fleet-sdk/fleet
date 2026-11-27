import { isEmpty } from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { describe, expect, it, test } from "vitest";
import signedTransactionVectors from "../_test-vectors/signedTransactions.json";
import {
  deserializableTxVectors,
  raffleSignedTransaction,
  unsignedTransactionVectors
} from "../_test-vectors/transactionVectors";
import { deserializeTransaction, serializeTransaction } from "./transactionSerializer";

describe("Transaction serializer", () => {
  test.each(unsignedTransactionVectors)("Should serialize unsigned transaction [$name]", (tv) => {
    const bytes = serializeTransaction(tv.json).toBytes();

    expect(hex.encode(bytes)).toBe(tv.hex);
    expect(hex.encode(blake2b256(bytes))).toBe(tv.hash);
  });

  test.each(signedTransactionVectors)("should serialize signed transaction", (tv) => {
    expect(serializeTransaction(tv.json).encode(hex)).toBe(tv.hex);
  });

  test.each(deserializableTxVectors)(
    "should roundtrip transaction serialization, case: $name",
    ({ tx }) => {
      const serialized = serializeTransaction(tx).toBytes();
      const deserialized = deserializeTransaction(serialized);

      expect(deserialized).toMatchObject(tx);
    }
  );

  it("should calculate the correct transaction id on deserialization", () => {
    const tv = raffleSignedTransaction; // signed transaction

    const serialized = serializeTransaction(tv).encode(hex);
    const deserialized = deserializeTransaction(serialized);

    expect(deserialized.id).toBe(tv.id);
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

    expect(serializeTransaction(tx).encode(hex)).toEqual(tv.hex);
  });

  it("should roundtrip transaction with SigmaProp in registers and context extension", () => {
    const sigmaPropHex = "08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
    const tx = structuredClone(unsignedTransactionVectors[2].json);
    tx.inputs[0].extension = { "0": sigmaPropHex };
    tx.outputs[0].additionalRegisters = { R4: sigmaPropHex };

    const serialized = serializeTransaction(tx).toBytes();
    const deserialized = deserializeTransaction(serialized);

    expect(deserialized.inputs[0]).toMatchObject({
      boxId: tx.inputs[0].boxId,
      extension: { "0": sigmaPropHex }
    });
    expect(deserialized.outputs[0].additionalRegisters).toEqual({ R4: sigmaPropHex });
    expect(deserialized.outputs).toHaveLength(tx.outputs.length);
  });
});
