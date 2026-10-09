---
"@fleet-sdk/mock-chain": patch
---

Fix `MockChain.execute()` mutating the caller's transaction object: outputs were distributed to parties by splicing the transaction's own `outputs` array, so a transaction passed as an EIP-12 object lost every output that matched a party (typically all of them). Outputs are now distributed over a copy, leaving the caller's object unchanged.
