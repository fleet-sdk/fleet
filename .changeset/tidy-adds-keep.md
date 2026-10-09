---
"@fleet-sdk/common": patch
---

Fix `Collection.add()` mutating the caller's array when adding multiple items at a specific index: the items are now inserted in reverse order by index instead of reversing the input array in place, so frozen arrays work and a caller's array keeps its order even when the add fails.
