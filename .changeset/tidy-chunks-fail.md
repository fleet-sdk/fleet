---
"@fleet-sdk/common": patch
"@fleet-sdk/core": patch
---

Fix `chunk()` and `TransactionBuilderSettings.setMaxTokensPerChangeBox()` accepting invalid sizes: a chunk size of zero or less looped forever, a non-integer size produced irregular or empty chunks (NaN silently dropped every element), and a single-chunk result aliased the caller's array. `chunk()` now throws a `RangeError` for a non-positive or non-integer size and always returns copied chunks, and the settings setter throws a `RangeError` for values outside 1..MAX_TOKENS_PER_BOX, leaving the previous value unchanged.
