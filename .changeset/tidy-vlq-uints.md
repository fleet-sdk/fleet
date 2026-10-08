---
"@fleet-sdk/serializer": patch
---

Fix VLQ encoding and decoding of unsigned 32-bit integers at and above 2^31. `writeVLQ` and `readVLQ` used JS bitwise operators, which truncate to 32 bits: `writeUInt(2147483648)` serialized as `0`, `writeUInt(4294967295)` as `127`, and the reference encoding of `4294967295` decoded as `-1`. Both now use arithmetic that covers the full unsigned 32-bit range, and values outside it throw a `RangeError`, matching the reference implementation's `putUInt`/`getUInt` bounds. This backs `SigmaByteWriter.writeUInt` / `SigmaByteReader.readUInt`, so box creation heights, ErgoTree sizes, and length prefixes in that range no longer corrupt silently.
