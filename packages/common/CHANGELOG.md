# @fleet-sdk/common

## 0.8.5

### Patch Changes

- 07bafd5: Add offset support to `startsWith`

## 0.8.3

### Patch Changes

- 9c04d3c: Add `SignedTransaction` serialization

## 0.8.0

### Patch Changes

- 36adc61: Fix `chunk` when passing an empty input array.

## 0.6.4

### Patch Changes

- 504974e: Fix `utxoDiff` miscalculation when tokens are present in subtrahend but not in minuend

## 0.4.1

### Patch Changes

- 28e3467: Fix `ensureDefaults()` behavior with `undefined` fields

## 0.3.4

### Patch Changes

- 9f02ca0: Fix ESM and CJS modules export

## 0.3.2

### Patch Changes

- 1d6e259: Add API TSDocs
- 1d6e259: Fix `ensureDefaults` function types

## 0.2.3

### Patch Changes

- 1e0edd4: Fix missing `types` export in `package.json`

## 0.2.2

### Patch Changes

- 9cbd414: Add `Block` and `BlockHeader` types.

## 0.2.1

### Patch Changes

- edf2830: Fix module exporting.

## 0.2.0

### Minor Changes

- 5a79c57: Add `concatBytes()` function.
- a491ab9: Add `ensureDefaults()` function.
- 3236dd8: Add new assertion functions:
  - `assertTypeOf()` - uses `typeof` to check for JavaScript type primitives;
  - `assertInstanceOf()` - uses `instanceof` to check for object instances.
- 9bd393b: Add `depthOf()` function.

## 0.1.3

### Patch Changes

- 92d8477: Move `Collection` model from core to common package.
- 280308a: Add `hasKey()` function.
- e9f4d74: Add `ensureUTxOBigInt()` function.
- 40a23b2: Add `percent()` function.
- be6364f: Refactored and added new assertion functions.
- d59dc22: Fix `first()` function when the first item is equal to zero.
- 452f97d: Add `min()` and `max()` utility functions.

## 0.1.2

### Patch Changes

- 72a8b4f: Fix NPM provenance

## 0.1.1

### Patch Changes

- ca22fab: Fix changesets

## 0.1.0

### Patch Changes

- 4759a8f: Add NPM provenance
- b67472a: Add `Box<T, R>` type improvements

## 0.1.0-alpha.32

### Patch Changes

- 4759a8f: Add NPM provenance

## 0.1.0-alpha.31

### Patch Changes

- b67472a: Add `Box<T, R>` type improvements
