# @fleet-sdk/wallet [![License](https://badgen.net/github/license/fleet-sdk/fleet/)](https://github.com/fleet-sdk/fleet/blob/master/LICENSE) [![npm](https://badgen.net/npm/v/@fleet-sdk/wallet)](https://www.npmjs.com/package/@fleet-sdk/wallet)

Key management and signature for Ergo Platform.

## SigmaJS prover

`SigmaJsProver` signs transactions through the SigmaJS interpreter, including inputs protected by arbitrary ErgoTree scripts. It requires the blockchain state context and current blockchain parameters used during reduction.

```ts
import { Network } from "@fleet-sdk/common";
import { SigmaJsProver } from "@fleet-sdk/wallet";

const prover = new SigmaJsProver({
  context,
  parameters,
  network: Network.Mainnet
});

const signedTransaction = prover.signTransaction(unsignedTransaction, keys);
```

The prover also implements `signMessage` and `verify` using SigmaJS Sigma proposition proofs.
