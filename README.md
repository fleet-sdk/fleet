# Fleet SDK [![Checks](https://badgen.net/github/checks/fleet-sdk/fleet/master)](https://github.com/fleet-sdk/fleet/actions) [![Coverage](https://codecov.io/gh/fleet-sdk/fleet/branch/master/graph/badge.svg)](https://app.codecov.io/gh/fleet-sdk/fleet)

Fleet (Fluent Ergo Toolset) is a pure JavaScript SDK for Ergo Platform. Fleet provides an easy, fluent and flexible way to write off chain-code for Ergo Platform.

## Packages

This is a [monorepository](https://monorepo.tools/) which means this contains many sub-packages that composes full Fleet SDK implementation.

| Package                                       | Description                                                                          |                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | :-----------------------------------------------------------------------------------------------------------: |
| [@fleet-sdk/core](/packages/core/)            | Core library with transaction builder and basic serialization.                       |       [![npm](https://badgen.net/npm/v/@fleet-sdk/core)](https://www.npmjs.com/package/@fleet-sdk/core)       |
| [@fleet-sdk/wallet](/packages/wallet)         | Wallet related library, with mnemonic and keys creation and derivation.              |     [![npm](https://badgen.net/npm/v/@fleet-sdk/wallet)](https://www.npmjs.com/package/@fleet-sdk/wallet)     |
| [@fleet-sdk/common](/packages/common)         | Internal utility functions, constants and types shared across `@fleet-sdk` packages. |     [![npm](https://badgen.net/npm/v/@fleet-sdk/common)](https://www.npmjs.com/package/@fleet-sdk/common)     |
| [@fleet-sdk/mock-chain](/packages/mock-chain) | Mock chain and testing utilities for Ergo Smart Contracts.                           | [![npm](https://badgen.net/npm/v/@fleet-sdk/mock-chain)](https://www.npmjs.com/package/@fleet-sdk/mock-chain) |
| [@fleet-sdk/compiler](/packages/compiler)     | Sigma.JS powered ErgoScript compiler.                                                |   [![npm](https://badgen.net/npm/v/@fleet-sdk/compiler)](https://www.npmjs.com/package/@fleet-sdk/compiler)   |

## Plugins

| Package                                              | Description                                                     |                                                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------: |
| [@fleet-sdk/babel-fees-plugin](/plugins/babel-fees/) | Fleet SDK plugin and utility functions for Babel Fees protocol. | [![npm](https://badgen.net/npm/v/@fleet-sdk/babel-fees-plugin)](https://www.npmjs.com/package/@fleet-sdk/babel-fees-plugin) |
| [@fleet-sdk/ageusd-plugin](/plugins/ageusd/)         | Fleet SDK plugin and utility functions for AgeUSD protocol.     |     [![npm](https://badgen.net/npm/v/@fleet-sdk/ageusd-plugin)](https://www.npmjs.com/package/@fleet-sdk/ageusd-plugin)     |

## Fleet SDK Usage Examples

- [Nautilus' internal transaction builder](https://github.com/capt-nemo429/nautilus-wallet/blob/master/src/api/ergo/transaction/txBuilder.ts#L95)
- [Ergonames SDK](https://github.com/ergonames/sdk/blob/master/tx-lib/index.js)
- [Stealth Address example implementation](https://github.com/ross-weir/ergo-stealth-address-example)
- [SigmaFi UI](https://github.com/capt-nemo429/sigmafi-ui)
