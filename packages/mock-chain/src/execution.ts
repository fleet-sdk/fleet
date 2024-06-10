import { ensureDefaults, Network } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { bigintBE, hex } from "@fleet-sdk/crypto";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { BlockchainParameters, BlockchainStateContext, ProverBuilder$ } from "sigmastate-js/main";
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

export type TransactionExecutionResult = {
  success: boolean;
  reason?: string;
};

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
  keys.forEach((key) => {
    if (!key.hasPrivateKey())
      throw new Error(`ErgoHDKey '${hex.encode(key.publicKey)}' must have a private key.`);
  });

  const eip12Tx = unsigned.toEIP12Object();
  const params = ensureDefaults(parameters, {
    context: mockBlockchainStateContext(),
    parameters: BLOCKCHAIN_PARAMETERS,
    network: Network.Mainnet,
    baseCost: 0
  });

  try {
    const proverBuilder = ProverBuilder$.create(params.parameters, params.network);
    keys.forEach((key) => proverBuilder.withDLogSecret(bigintBE.encode(key.privateKey!)));
    const prover = proverBuilder.build();

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
    return { success: false, reason: (e as Error).message };
  }
}
