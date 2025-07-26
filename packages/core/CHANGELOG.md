# @fleet-sdk/core

## 0.12.0

### Minor Changes

- 4f3bdff: Add ErgoTree named constants replacing support
- 4f3bdff: Add ErgoTree construction from ergoc compiler JSON output

## 0.11.0

### Patch Changes

- Updated dependencies [fbb4ff0]
- Updated dependencies [c175957]
  - @fleet-sdk/crypto@0.11.0
  - @fleet-sdk/serializer@0.11.0

## 0.10.0

### Minor Changes

- 799fff2: Filter out tokens with zero amounts on output build

### Patch Changes

- 5125398: Support instantiating `ErgoBox` from another `ErgoBox`
- fd4ffd7: Support context extension variables merging
- Updated dependencies [b17af12]
  - @fleet-sdk/common@0.10.0
  - @fleet-sdk/crypto@0.10.0
  - @fleet-sdk/serializer@0.10.0

## 0.9.1

### Patch Changes

- Updated dependencies [59018ee]
  - @fleet-sdk/common@0.9.1
  - @fleet-sdk/serializer@0.9.1
  - @fleet-sdk/crypto@0.9.1

## 0.9.0

### Minor Changes

- eeb2f66: Add `ErgoTree` template extraction
- eeb2f66: Add `ErgoTree` constant replacement

### Patch Changes

- a33850a: Add `OutputBuilder` creation from `Box` object
- Updated dependencies [c558227]
- Updated dependencies [ed7e44c]
  - @fleet-sdk/serializer@0.9.0

## 0.8.5

### Patch Changes

- Updated dependencies [be6867a]
- Updated dependencies [3b2a774]
- Updated dependencies [07bafd5]
- Updated dependencies [2e627a5]
  - @fleet-sdk/serializer@0.8.5
  - @fleet-sdk/common@0.8.5
  - @fleet-sdk/crypto@0.8.5

## 0.8.3

### Patch Changes

- Updated dependencies [9c04d3c]
  - @fleet-sdk/serializer@0.8.3
  - @fleet-sdk/common@0.8.3
  - @fleet-sdk/crypto@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [66d6fc9]
- Updated dependencies [9a244b5]
- Updated dependencies [1c8541a]
- Updated dependencies [1b07c4a]
  - @fleet-sdk/serializer@0.8.2
  - @fleet-sdk/crypto@0.8.2

## 0.8.1

### Patch Changes

- c0a3d35: Override ErgoTree encoding network from constructor params
- c0a3d35: Add `ErgoTree.encode()` method

## 0.8.0

### Minor Changes

- 9f8b5ee: Add transaction chain building

### Patch Changes

- Updated dependencies [a47a5fd]
- Updated dependencies [36adc61]
- Updated dependencies [b2ce7aa]
  - @fleet-sdk/serializer@0.8.0
  - @fleet-sdk/common@0.8.0
  - @fleet-sdk/crypto@0.8.0

## 0.7.0

### Minor Changes

- a08a573: Add `ensureInclusion` flag to the `TransactionBuilder#from` method to ensure both inclusion and order of inputs

### Patch Changes

- Updated dependencies [9fceb6f]
- Updated dependencies [62025c4]
  - @fleet-sdk/serializer@0.7.0

## 0.6.4

### Patch Changes

- Updated dependencies [504974e]
  - @fleet-sdk/common@0.6.4
  - @fleet-sdk/crypto@0.6.4
  - @fleet-sdk/serializer@0.6.4

## 0.6.1

### Patch Changes

- ece573c: Set default token limit for a single box to `100`

## 0.5.0

### Minor Changes

- 8f14d37: Add `ErgoMessage` class for arbitrary data signing

### Patch Changes

- Updated dependencies [9dd0b55]
- Updated dependencies [6ecfd2e]
  - @fleet-sdk/serializer@0.5.0
  - @fleet-sdk/crypto@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies [d6ef248]
- Updated dependencies [28e3467]
  - @fleet-sdk/serializer@0.4.1
  - @fleet-sdk/common@0.4.1
  - @fleet-sdk/crypto@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [0089ed6]
- Updated dependencies [70aea89]
- Updated dependencies [253d37a]
- Updated dependencies [0089ed6]
  - @fleet-sdk/serializer@0.4.0
  - @fleet-sdk/crypto@0.4.0

## 0.3.4

### Patch Changes

- 0fbe19f: Keep assets call order when minting a token
- 9f02ca0: Fix ESM and CJS modules export
- Updated dependencies [9f02ca0]
  - @fleet-sdk/serializer@0.3.4
  - @fleet-sdk/common@0.3.4
  - @fleet-sdk/crypto@0.3.4

## 0.3.2

### Patch Changes

- 1d6e259: Accept `SConstant` type in `OutputBuilder#setAdditionalRegisters()` and `ErgoUnsignedInput#setContextExtension()` methods
- Updated dependencies [1d6e259]
- Updated dependencies [1d6e259]
  - @fleet-sdk/common@0.3.2
  - @fleet-sdk/crypto@0.3.2
  - @fleet-sdk/serializer@0.3.2

## 0.2.3

### Patch Changes

- ce1b6f3: Add `addNfts` convenience method to `OutputBuilder`
- 1e0edd4: Fix missing `types` export in `package.json`
- Updated dependencies [37cdfdd]
- Updated dependencies [1e0edd4]
- Updated dependencies [65d5b33]
- Updated dependencies [514dcd2]
  - @fleet-sdk/serializer@0.2.3
  - @fleet-sdk/common@0.2.3
  - @fleet-sdk/crypto@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [9cbd414]
  - @fleet-sdk/common@0.2.2
  - @fleet-sdk/crypto@0.2.2
  - @fleet-sdk/serializer@0.2.2

## 0.2.1

### Patch Changes

- edf2830: Fix module exporting.
- Updated dependencies [edf2830]
  - @fleet-sdk/serializer@0.2.1
  - @fleet-sdk/common@0.2.1
  - @fleet-sdk/crypto@0.2.1

## 0.2.0

### Patch Changes

- fffd1ed: Fix wrong minimal amount estimation while minting a token.
- Updated dependencies [5a79c57]
- Updated dependencies [76d4c3d]
- Updated dependencies [cd877ce]
- Updated dependencies [8a13a29]
- Updated dependencies [a491ab9]
- Updated dependencies [3236dd8]
- Updated dependencies [cd877ce]
- Updated dependencies [e532fb8]
- Updated dependencies [9bd393b]
- Updated dependencies [2ab9661]
- Updated dependencies [2ab9661]
  - @fleet-sdk/common@0.2.0
  - @fleet-sdk/serializer@0.2.0
  - @fleet-sdk/crypto@0.2.0

## 0.1.3

### Patch Changes

- 92d8477: Move `Collection` model from core to common package.
- b51587f: **Transaction Builder**: add `setFee` method to the plugin context.
- f91cccd: Add `ErgoTree` model.
- Updated dependencies [92d8477]
- Updated dependencies [280308a]
- Updated dependencies [e9f4d74]
- Updated dependencies [40a23b2]
- Updated dependencies [be6364f]
- Updated dependencies [d59dc22]
- Updated dependencies [452f97d]
  - @fleet-sdk/common@0.1.3

## 0.1.2

### Patch Changes

- 72a8b4f: Fix NPM provenance
- Updated dependencies [72a8b4f]
  - @fleet-sdk/common@0.1.2

## 0.1.1

### Patch Changes

- ca22fab: Fix changesets
- Updated dependencies [ca22fab]
  - @fleet-sdk/common@0.1.1

## 0.1.0

### Patch Changes

- 4759a8f: Add NPM provenance
- 0b3c7bc: Improve `OutputBuilder.setAdditionalRegisters()` type safety
- Updated dependencies [4759a8f]
- Updated dependencies [b67472a]
  - @fleet-sdk/common@0.1.0

## 0.1.0-alpha.32

### Patch Changes

- 4759a8f: Add NPM provenance
- Updated dependencies [4759a8f]
  - @fleet-sdk/common@0.1.0-alpha.32

## 0.1.0-alpha.31

### Patch Changes

- 0b3c7bc: Improve `OutputBuilder.setAdditionalRegisters()` type safety
- Updated dependencies [b67472a]
  - @fleet-sdk/common@0.1.0-alpha.31
