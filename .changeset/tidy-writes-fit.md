---
"@fleet-sdk/serializer": patch
---

fix(serializer): throw on writes that exceed the SigmaByteWriter buffer capacity instead of silently dropping bytes
