import { isEmpty } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import {
  BlockHeaders,
  ErgoBoxes,
  ErgoStateContext,
  PreHeader,
  SecretKey,
  SecretKeys,
  UnsignedTransaction,
  Wallet
} from "ergo-lib-wasm-nodejs";
import { Header, mockHeaders } from "./objectMocking";

export type TransactionExecutionResult = {
  success: boolean;
  reason?: string;
};

export function execute(
  unsignedTransaction: ErgoUnsignedTransaction,
  keys: ErgoHDKey[],
  headers?: Header[]
): TransactionExecutionResult {
  if (isEmpty(headers)) {
    headers = mockHeaders(10);
  }

  const wasmContext = getWasmTransactionContext(unsignedTransaction, headers);
  const wasmWallet = buildWasmWallet(keys);

  try {
    wasmWallet.sign_transaction(
      wasmContext.signContext,
      wasmContext.transaction,
      wasmContext.inputs,
      wasmContext.dataInputs
    );

    return { success: true };
  } catch (e) {
    return { success: false, reason: (e as Error).message };
  }
}

function buildWasmWallet(keys: ErgoHDKey[]): Wallet {
  const sks = new SecretKeys();

  for (const key of keys) {
    if (key.privateKey) {
      sks.add(SecretKey.dlog_from_bytes(key.privateKey));
    }
  }

  return Wallet.from_secrets(sks);
}

function getWasmTransactionContext(
  unsignedTransaction: ErgoUnsignedTransaction,
  headers: Header[]
): {
  inputs: ErgoBoxes;
  dataInputs: ErgoBoxes;
  transaction: UnsignedTransaction;
  signContext: ErgoStateContext;
} {
  const eip12Transaction = unsignedTransaction.toEIP12Object();

  const wasmHeaders = BlockHeaders.from_json(headers);
  const preHeader = PreHeader.from_block_header(wasmHeaders.get(0));

  return {
    inputs: ErgoBoxes.from_boxes_json(eip12Transaction.inputs),
    dataInputs: ErgoBoxes.from_boxes_json(eip12Transaction.dataInputs),
    transaction: UnsignedTransaction.from_json(JSON.stringify(eip12Transaction)),
    signContext: new ErgoStateContext(preHeader, wasmHeaders)
  };
}
