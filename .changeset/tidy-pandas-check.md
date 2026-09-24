---
"@fleet-sdk/mock-chain": minor
---

Add executor transaction checks to the mock chain (issue #120). MockChain now enforces minimum output box values and miner fee requirements (standard fee contract detection, per-byte fee threshold, custom fee trees) by default, with opt-outs via `checks: { minBoxValue: false }` / `checks: { fee: false }`.
