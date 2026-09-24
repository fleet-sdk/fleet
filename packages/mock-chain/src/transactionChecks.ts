import {
  type EIP12UnsignedTransaction,
  FEE_CONTRACT,
  type HexString,
  byteSizeOf,
  ensureBigInt
} from "@fleet-sdk/common";
import { estimateBoxSize } from "@fleet-sdk/serializer";
import type { BlockchainParameters } from "sigmastate-js/main";

/**
 * Default minimum fee, in nanoERGs, per serialized transaction byte.
 *
 * This is a mock-chain testing policy, not a consensus rule nor a prediction
 * of miner acceptance.
 */
export const DEFAULT_MIN_FEE_PER_BYTE = BigInt(100);

export type FeeCheckOptions = {
  /**
   * Additional ErgoTree scripts recognized as miner fee boxes.
   * The standard fee contract is always accepted.
   */
  feeTrees?: HexString[];
  /**
   * Minimum fee, in nanoERGs, per serialized transaction byte.
   * @default DEFAULT_MIN_FEE_PER_BYTE
   */
  minFeePerByte?: bigint;
};

export type TransactionChecksOptions = {
  /**
   * Reject outputs carrying less than `minValuePerByte * serializedBoxSize`
   * nanoERGs.
   * @default true
   */
  minBoxValue?: boolean;
  /**
   * Require a miner fee output and a fee-per-byte ratio at or above the
   * threshold. Set to `false` to disable; pass an object to customize.
   * @default true
   */
  fee?: boolean | FeeCheckOptions;
};

/**
 * Runs the configured transaction checks, returning a list of human-readable
 * error messages. An empty list means the transaction passes all checks.
 */
export function checkTransaction(
  transaction: EIP12UnsignedTransaction,
  parameters: BlockchainParameters,
  options?: TransactionChecksOptions
): string[] {
  const errors: string[] = [];
  const { minBoxValue = true, fee = true } = options ?? {};

  if (minBoxValue) {
    errors.push(...checkMinBoxValue(transaction.outputs, parameters.minValuePerByte));
  }

  if (fee !== false) {
    errors.push(...checkMinerFee(transaction, fee === true ? {} : fee));
  }

  return errors;
}

function checkMinBoxValue(
  outputs: EIP12UnsignedTransaction["outputs"],
  minValuePerByte: number
): string[] {
  const errors: string[] = [];

  outputs.forEach((output, index) => {
    let size: number;
    try {
      size = estimateBoxSize(output);
    } catch {
      errors.push(`Output at index ${index} cannot be measured: creation height is undefined.`);
      return;
    }

    const minValue = BigInt(size) * BigInt(minValuePerByte);
    const value = ensureBigInt(output.value);

    if (value < minValue) {
      errors.push(
        `Output at index ${index} carries ${value} nanoERGs, below the minimum of ` +
          `${minValue} nanoERGs (${size} bytes * ${minValuePerByte} nanoERGs/byte).`
      );
    }
  });

  return errors;
}

function checkMinerFee(transaction: EIP12UnsignedTransaction, options: FeeCheckOptions): string[] {
  const { feeTrees = [], minFeePerByte = DEFAULT_MIN_FEE_PER_BYTE } = options;
  const acceptedTrees = [FEE_CONTRACT, ...feeTrees];

  const feeBoxes = transaction.outputs.filter((output) => acceptedTrees.includes(output.ergoTree));

  if (feeBoxes.length === 0) {
    return ["Transaction must include a miner fee output."];
  }

  const totalFee = feeBoxes.reduce((sum, box) => sum + ensureBigInt(box.value), BigInt(0));
  const size = estimateTransactionSize(transaction);
  const feePerByte = size > 0 ? totalFee / BigInt(size) : BigInt(0);
  const threshold = ensureBigInt(minFeePerByte);

  if (feePerByte < threshold) {
    return [
      `Transaction fee of ${totalFee} nanoERGs is below the fee-per-byte threshold: ` +
        `${feePerByte} < ${threshold} nanoERGs/byte (estimated tx size: ${size} bytes).`
    ];
  }

  return [];
}

/**
 * Estimates the serialized size, in bytes, of an unsigned transaction.
 * Spending proofs are not included as they only exist after signing.
 */
function estimateTransactionSize(transaction: EIP12UnsignedTransaction): number {
  let size = 8; // version, counts and other fixed fields

  for (const input of transaction.inputs) {
    size += 32; // boxId
    for (const value of Object.values(input.extension)) {
      if (value) size += byteSizeOf(value);
    }
  }

  size += transaction.dataInputs.length * 32; // data input boxIds

  for (const output of transaction.outputs) {
    try {
      size += estimateBoxSize(output);
    } catch {
      // unmeasurable outputs are reported by checkMinBoxValue; skip here
    }
  }

  return size;
}
