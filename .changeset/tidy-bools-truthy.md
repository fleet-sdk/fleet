---
"@fleet-sdk/serializer": patch
---

Fix `SigmaByteReader.readBool()` reading any boolean byte other than `0x01` as false. The reference implementation (sigmastate's `CoreDataSerializer`) reads a boolean as `getUByte() != 0`, so a non-canonical byte such as `0x02` or `0xff` in an `SBool` constant is true; it was previously parsed as false, silently flipping the value.
