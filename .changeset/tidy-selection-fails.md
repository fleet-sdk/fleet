---
"@fleet-sdk/core": patch
---

fix(core): throw InsufficientInputs when a token target cannot be reached because no selected input holds the token, instead of crashing with "Empty array." or a TypeError on empty selections
