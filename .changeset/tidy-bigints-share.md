---
"@fleet-sdk/common": patch
---

Fix `decimalize()` and `undecimalize()` mutating the caller's options object: the resolved `decimals` and `decimalMark` defaults were assigned back into the passed object, so a caller's options came back with fields it never set (and a frozen options object threw a `TypeError`). The defaults are now resolved into local variables, leaving the caller's object untouched; outputs are unchanged.
