---
"@fleet-sdk/core": patch
---

fix(core): keep TokensCollection minting metadata attached to the minting token when other tokens are inserted or removed, instead of reporting another token's amount, reporting a minting token that was removed, or throwing a TypeError
