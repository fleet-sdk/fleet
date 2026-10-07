---
"@fleet-sdk/core": patch
---

Fix `ErgoAddress.toP2SH()` hashing the full ErgoTree bytes instead of the serialized proposition, which produced P2SH addresses whose boxes cannot be spent. The hash is now calculated over the proposition bytes (the tree body without the header, skipping the size field when the size inclusion flag is set), matching sigmastate-interpreter's `Pay2SHAddress`. Converting a constant-segregated ErgoTree to P2SH now throws an explicit error instead of silently returning a mismatched address, as the reference hashes the proposition with the constants substituted into it — a form that cannot be derived from the raw tree bytes alone.
