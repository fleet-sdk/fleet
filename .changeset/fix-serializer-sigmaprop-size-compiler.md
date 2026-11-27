---
"@fleet-sdk/serializer": patch
"@fleet-sdk/compiler": patch
---

Fix `SSigmaProp` round-trip serialization, constant buffer size estimation for non-embeddable collections and large nested structures, `SColl(SByte, "")` empty-string handling, and `compile()` version and network option validation.
