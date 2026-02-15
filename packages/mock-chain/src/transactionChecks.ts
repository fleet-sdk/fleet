import {
  type BoxCandidate,
  type EIP12UnsignedTransaction,
  FEE_CONTRACT,
  type HexString,
  byteSizeOf,
  ensureBigInt
} from "@fleet-sdk/common";
import { estimateBoxSize } from "@fleet-sdk/serializer";
import type { BlockchainParameters } from "sigmastate-js/main";

/**
 * Options for customizing transaction validation checks.
 */
export type TransactionCheckOptions = {
  /** Enable/disable minimum nanoergs per box check (default: true) */
  checkMinNanoergsPerBox?: boolean;
  /** Enable/disable miner fee validation (default: true) */
  checkMinerFee?: boolean;
  /** Minimum fee per byte in nanoergs (default: 1000) */
  minFeePerByte?: bigint;
  /** Custom fee tree ErgoTree scripts to recognize as valid fee boxes */
  customFeeErgoTrees?: HexString[];
};

/**
 * Result of transaction validation checks.
 */
export type TransactionCheckResult = {
  success: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Default minimum fee per byte in nanoergs.
 * This is a conservative threshold that allows realistic transaction fees.
 * The Ergo network doesn't enforce a strict fee-per-byte minimum, but this
 * helps catch transactions with unreasonably low fees.
 */
export const DEFAULT_MIN_FEE_PER_BYTE = BigInt(100);

/**
 * Validates a transaction against various checks including minimum box values and fees.
 *
 * @param transaction - The unsigned transaction to validate
 * @param parameters - Blockchain parameters containing minValuePerByte
 * @param options - Configuration options for the checks
 * @returns Validation result with success status and any errors/warnings
 */
export function validateTransaction(
  transaction: EIP12UnsignedTransaction,
  parameters: BlockchainParameters,
  options?: TransactionCheckOptions
): TransactionCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const opts = {
    checkMinNanoergsPerBox: true,
    checkMinerFee: true,
    minFeePerByte: DEFAULT_MIN_FEE_PER_BYTE,
    customFeeErgoTrees: [],
    ...options
  };

  // Check minimum nanoergs per box
  if (opts.checkMinNanoergsPerBox) {
    const minValueErrors = checkMinNanoergsPerBox(transaction.outputs, parameters.minValuePerByte);
    errors.push(...minValueErrors);
  }

  // Check miner fee
  if (opts.checkMinerFee) {
    const feeCheckResult = checkMinerFee(transaction, opts.minFeePerByte, opts.customFeeErgoTrees);
    errors.push(...feeCheckResult.errors);
    warnings.push(...feeCheckResult.warnings);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if each output box meets the minimum nanoergs requirement based on its size.
 *
 * The minimum value is calculated as: boxSize * minValuePerByte
 *
 * @param outputs - Transaction output boxes to check
 * @param minValuePerByte - Minimum nanoergs per byte (from blockchain parameters)
 * @returns Array of error messages for boxes that don't meet the requirement
 */
export function checkMinNanoergsPerBox(
  outputs: BoxCandidate<string>[],
  minValuePerByte: number
): string[] {
  const errors: string[] = [];

  for (let i = 0; i < outputs.length; i++) {
    const box = outputs[i];
    const boxValue = ensureBigInt(box.value);

    // Estimate the box size in bytes
    const boxSize = estimateBoxSize(box);

    // Calculate minimum required value
    const minValue = BigInt(boxSize) * BigInt(minValuePerByte);

    if (boxValue < minValue) {
      errors.push(
        `Output box ${i} has insufficient value: ${boxValue} nanoergs, ` +
          `minimum required: ${minValue} nanoergs (${boxSize} bytes * ${minValuePerByte} nanoergs/byte)`
      );
    }
  }

  return errors;
}

/**
 * Checks if the transaction includes a valid miner fee box and meets the fee per byte threshold.
 *
 * @param transaction - The unsigned transaction to check
 * @param minFeePerByte - Minimum fee per byte in nanoergs
 * @param customFeeErgoTrees - Additional ErgoTree scripts to recognize as fee boxes
 * @returns Check result with errors and warnings
 */
export function checkMinerFee(
  transaction: EIP12UnsignedTransaction,
  minFeePerByte: bigint,
  customFeeErgoTrees: HexString[] = []
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Find fee boxes (standard fee contract or custom fee trees)
  const validFeeErgoTrees = [FEE_CONTRACT, ...customFeeErgoTrees];
  const feeBoxes = transaction.outputs.filter((box) => validFeeErgoTrees.includes(box.ergoTree));

  if (feeBoxes.length === 0) {
    warnings.push("No miner fee box found in transaction outputs");
    return { errors, warnings };
  }

  // Calculate total fee
  const totalFee = feeBoxes.reduce((sum, box) => sum + ensureBigInt(box.value), BigInt(0));

  // Calculate transaction size
  const txSize = calculateTransactionSize(transaction);

  // Calculate fee per byte
  const feePerByte = txSize > 0 ? totalFee / BigInt(txSize) : BigInt(0);

  if (feePerByte < minFeePerByte) {
    errors.push(
      `Transaction fee per byte (${feePerByte} nanoergs/byte) is below minimum ` +
        `(${minFeePerByte} nanoergs/byte). Total fee: ${totalFee} nanoergs, ` +
        `Transaction size: ${txSize} bytes`
    );
  }

  // Check for multiple fee boxes (unusual but not necessarily an error)
  if (feeBoxes.length > 1) {
    warnings.push(
      `Transaction contains ${feeBoxes.length} fee boxes with total fee: ${totalFee} nanoergs`
    );
  }

  return { errors, warnings };
}

/**
 * Estimates the size of a transaction in bytes.
 * This is a simplified estimation that may not be 100% accurate but is sufficient for fee checks.
 *
 * @param transaction - The unsigned transaction
 * @returns Estimated size in bytes
 */
function calculateTransactionSize(transaction: EIP12UnsignedTransaction): number {
  let size = 0;

  // Base transaction overhead (simplified estimation)
  size += 100; // Base overhead for transaction structure

  // Inputs size (simplified: boxId + proof placeholder)
  for (const input of transaction.inputs) {
    size += byteSizeOf(input.boxId);
    size += 100; // Estimated proof size (varies based on script complexity)

    if (input.extension && Object.keys(input.extension).length > 0) {
      // Add extension size if present
      size += JSON.stringify(input.extension).length; // Simplified estimation
    }
  }

  // Data inputs size
  for (const dataInput of transaction.dataInputs) {
    size += byteSizeOf(dataInput.boxId);
  }

  // Outputs size
  for (const output of transaction.outputs) {
    size += estimateBoxSize(output);
  }

  return size;
}

/**
 * Checks if an ErgoTree script is a recognized fee contract.
 *
 * @param ergoTree - The ErgoTree script to check
 * @param customFeeErgoTrees - Additional custom fee trees to recognize
 * @returns True if the ErgoTree is a fee contract
 */
export function isFeeContract(ergoTree: HexString, customFeeErgoTrees: HexString[] = []): boolean {
  return ergoTree === FEE_CONTRACT || customFeeErgoTrees.includes(ergoTree);
}
