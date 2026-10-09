---
"@fleet-sdk/crypto": patch
---

Fix `blake2b()` mutating the caller's options object: the `key`, `salt`, and `personalization` fields were converted from hex strings to `Uint8Array` in place, so a caller's options object came back changed (and a frozen options object threw a `TypeError`). The conversion now happens in a fresh options object, leaving the caller's object untouched; hash outputs are unchanged.
