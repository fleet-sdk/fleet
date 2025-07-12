# @fleet-sdk/serializer

## 0.11.0

### Minor Changes

- c175957: Add `SAvlTree` serialization and deserialization

### Patch Changes

- Updated dependencies [fbb4ff0]
  - @fleet-sdk/crypto@0.11.0

## 0.10.0

### Patch Changes

- Updated dependencies [b17af12]
  - @fleet-sdk/common@0.10.0
  - @fleet-sdk/crypto@0.10.0

## 0.9.1

### Patch Changes

- 59018ee: No relevant changes
- Updated dependencies [59018ee]
  - @fleet-sdk/common@0.9.1
  - @fleet-sdk/crypto@0.9.1

## 0.9.0

### Patch Changes

- c558227: Memoize `SConstant` bytes for efficient re-encoding
- ed7e44c: Add `SigmaByteReader#readRemainingBytes` method

## 0.8.5

### Patch Changes

- be6867a: Add `deserializeBox` function
- 3b2a774: Add `deserializeTransaction` function
- 2e627a5: Add `SBox` constant serialization and deserialization.
- Updated dependencies [07bafd5]
  - @fleet-sdk/common@0.8.5
  - @fleet-sdk/crypto@0.8.5

## 0.8.3

### Patch Changes

- 9c04d3c: Add `SignedTransaction` serialization
- Updated dependencies [9c04d3c]
  - @fleet-sdk/common@0.8.3
  - @fleet-sdk/crypto@0.8.3

## 0.8.2

### Patch Changes

- 66d6fc9: Fix `ZigZag` encoding for 32-bit integers
- 1c8541a: Fix signed `SByte` parsing
- Updated dependencies [9a244b5]
- Updated dependencies [1b07c4a]
  - @fleet-sdk/crypto@0.8.2

## 0.8.0

### Patch Changes

- a47a5fd: Fix types for nested `SColl[SBytes]` creation.
- Updated dependencies [36adc61]
- Updated dependencies [b2ce7aa]
  - @fleet-sdk/common@0.8.0
  - @fleet-sdk/crypto@0.8.0

## 0.7.0

### Minor Changes

- 9fceb6f: **🚨 BREAKING CHANGE**: `decode` function now returns `SConstant` instead of data directly
- 62025c4: Introduce `stypeof` utility function

## 0.6.4

### Patch Changes

- Updated dependencies [504974e]
  - @fleet-sdk/common@0.6.4
  - @fleet-sdk/crypto@0.6.4

## 0.5.0

### Patch Changes

- 9dd0b55: Export `SigmaByteWriter` and `SigmaByteReader` classes
- Updated dependencies [6ecfd2e]
  - @fleet-sdk/crypto@0.5.0

## 0.4.1

### Patch Changes

- d6ef248: Fix: export `decode()` function
- Updated dependencies [28e3467]
  - @fleet-sdk/common@0.4.1
  - @fleet-sdk/crypto@0.4.1

## 0.4.0

### Minor Changes

- 0089ed6: Deprecate `parse()` function
- 0089ed6: Add `decode()` function

### Patch Changes

- Updated dependencies [70aea89]
- Updated dependencies [253d37a]
  - @fleet-sdk/crypto@0.4.0

## 0.3.4

### Patch Changes

- 9f02ca0: Fix ESM and CJS modules export
- Updated dependencies [9f02ca0]
  - @fleet-sdk/common@0.3.4
  - @fleet-sdk/crypto@0.3.4

## 0.3.2

### Patch Changes

- Updated dependencies [1d6e259]
- Updated dependencies [1d6e259]
  - @fleet-sdk/common@0.3.2
  - @fleet-sdk/crypto@0.3.2

## 0.2.3

### Patch Changes

- 37cdfdd: Add support for possibly `undefined` values to `parse()` function when in `safe` mode.
- 1e0edd4: Fix missing `types` export in `package.json`
- Updated dependencies [1e0edd4]
- Updated dependencies [65d5b33]
- Updated dependencies [514dcd2]
  - @fleet-sdk/common@0.2.3
  - @fleet-sdk/crypto@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [9cbd414]
  - @fleet-sdk/common@0.2.2
  - @fleet-sdk/crypto@0.2.2

## 0.2.1

### Patch Changes

- edf2830: Fix module exporting.
- Updated dependencies [edf2830]
  - @fleet-sdk/common@0.2.1
  - @fleet-sdk/crypto@0.2.1

## 0.2.0

### Minor Changes

- 76d4c3d: Introduce `serializer` package.
- cd877ce: Add embedded `SColl` support.
- cd877ce: Add `SPair` type support.
- e532fb8: Add type string representation.

### Patch Changes

- Updated dependencies [5a79c57]
- Updated dependencies [8a13a29]
- Updated dependencies [a491ab9]
- Updated dependencies [3236dd8]
- Updated dependencies [9bd393b]
- Updated dependencies [2ab9661]
- Updated dependencies [2ab9661]
  - @fleet-sdk/common@0.2.0
  - @fleet-sdk/crypto@0.2.0
