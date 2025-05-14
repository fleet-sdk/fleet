import { Network, ensureDefaults } from "@fleet-sdk/common";
import type { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { bigintBE, hex } from "@fleet-sdk/crypto";
import type { ErgoHDKey } from "@fleet-sdk/wallet";
import {
  type BlockchainParameters,
  type BlockchainStateContext,
  ProverBuilder$
} from "sigmastate-js/main";
import { mockBlockchainStateContext } from "./objectMocking";

/**
 * blockchain parameters at height 1283632
 */
export const BLOCKCHAIN_PARAMETERS: BlockchainParameters = {
  storageFeeFactor: 1250000,
  minValuePerByte: 360,
  maxBlockSize: 1271009,
  tokenAccessCost: 100,
  inputCost: 2407,
  dataInputCost: 100,
  outputCost: 197,
  maxBlockCost: 8001091,
  blockVersion: 3
};

export type TransactionExecutionSuccess = {
  success: true;
};

export type TransactionExecutionFailure = {
  success: false;
  reason: Error;
};

export type TransactionExecutionResult = TransactionExecutionSuccess | TransactionExecutionFailure;

export type ExecutionParameters = {
  context?: BlockchainStateContext;
  parameters?: BlockchainParameters;
  network?: Network;
  baseCost?: number;
};

export function execute(
  unsigned: ErgoUnsignedTransaction,
  keys: ErgoHDKey[],
  parameters?: ExecutionParameters
): TransactionExecutionResult {
  for (const key of keys) {
    if (!key.hasPrivateKey()) {
      throw new Error(`ErgoHDKey '${hex.encode(key.publicKey)}' must have a private key.`);
    }
  }

  const eip12Tx = unsigned.toEIP12Object();
  const params = ensureDefaults(parameters, {
    context: mockBlockchainStateContext(),
    parameters: BLOCKCHAIN_PARAMETERS,
    network: Network.Mainnet,
    baseCost: 0
  });

  try {
    const builder = ProverBuilder$.create(params.parameters, params.network);
    for (const key of keys) {
      builder.withDLogSecret(bigintBE.encode(key.privateKey as Uint8Array));
    }
    const prover = builder.build();

    const reducedTx = prover.reduce(
      params.context,
      eip12Tx,
      eip12Tx.inputs,
      eip12Tx.dataInputs,
      unsigned.burning.tokens,
      params.baseCost
    );

    prover.signReduced(reducedTx);

    return { success: true };
  } catch (e) {
    return { success: false, reason: e as Error };
  }
}
