---
"@fleet-sdk/serializer": patch
---

fix(serializer): throw on out-of-bounds reads in SigmaByteReader instead of returning undefined or truncated data
