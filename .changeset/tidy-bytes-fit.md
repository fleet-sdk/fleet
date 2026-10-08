---
"@fleet-sdk/serializer": patch
---

Reject out-of-range `SByte` values on serialization. A new `SigmaByteWriter.writeI8` applies the same `RangeError` check the other signed writers (`writeI16`/`writeI32`/`writeI64`/`writeI256`) already had, and the data serializer now uses it for the byte type. Previously an out-of-range byte was written through the raw byte writer, so values in 128..255 parsed back as negative and values of 256 or more silently wrapped modulo 256 (256 became 0).
