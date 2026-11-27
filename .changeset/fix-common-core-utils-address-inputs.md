---
"@fleet-sdk/common": patch
"@fleet-sdk/core": patch
---

Fix negative fractional formatting in `decimalize()`, whitespace handling in `undecimalize()`, strict raw hex validation in `isHex()`, non-positive token and count handling in `utxoDiff()`/`utxoFilter()`, `options` forwarding in `InputsCollection._addOne()`, address validation in `validateAddress()`/`validateUnpackedAddress()`, and 32-byte hash length validation in `ErgoMessage`
