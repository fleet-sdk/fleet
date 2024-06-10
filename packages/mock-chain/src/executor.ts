import { Network, isEmpty } from "@fleet-sdk/common";
import { ErgoUnsignedTransaction } from "@fleet-sdk/core";
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { Header, mockBlockchainStateContext, mockHeaders } from "./objectMocking";
import { BlockchainParameters, BlockchainStateContext, ProverBuilder$ } from "sigmastate-js/main";
import { bigintBE, hex } from "@fleet-sdk/crypto";

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

export function execute(
  unsignedTransaction: ErgoUnsignedTransaction,
  keys: ErgoHDKey[],
  context?: BlockchainStateContext,
  blockchainParameters: BlockchainParameters = BLOCKCHAIN_PARAMETERS,
  network: Network = Network.Mainnet,
  baseCost = 0
): TransactionExecutionResult {
  keys.forEach((key) => {
    if (!key.hasPrivateKey())
      throw new Error(`ErgoHDKey '${hex.encode(key.publicKey)}' must have a private key.`);
  });

  if (isEmpty(context)) {
    context = mockBlockchainStateContext();
  }

  const eip12Tx = unsignedTransaction.toEIP12Object();

  try {
    const proverBuilder = ProverBuilder$.create(blockchainParameters, network);
    keys.forEach((key) => proverBuilder.withDLogSecret(bigintBE.encode(key.privateKey!)));
    const prover = proverBuilder.build();

    const reducedTx = prover.reduce(
      context,
      eip12Tx,
      eip12Tx.inputs,
      eip12Tx.dataInputs,
      unsignedTransaction.burning.tokens,
      baseCost
    );

    prover.signReduced(reducedTx);

    return { success: true };
  } catch (e) {
    return { success: false, reason: (e as Error).message };
  }
}
