---
"@fleet-sdk/serializer": patch
---

Reject `BigInt` values that don't fit in 256 bits on deserialization. `SigmaByteReader.readI256()` now enforces the same range as `writeI256()`, so oversized `SBigInt` constants — which the reference implementation rejects and which could not be re-serialized — no longer parse silently.
