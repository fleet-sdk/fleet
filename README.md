# Fleet SDK [![Checks](https://badgen.net/github/checks/fleet-sdk/fleet/master)](https://github.com/fleet-sdk/fleet/actions) [![Coverage](https://codecov.io/gh/fleet-sdk/fleet/branch/master/graph/badge.svg)](https://app.codecov.io/gh/fleet-sdk/fleet)

Fleet (Fluent Ergo Toolset) is a pure JavaScript SDK for Ergo Platform. Fleet provides an easy, fluent and flexible way to write off chain-code for Ergo Platform.

## Packages

This is a [monorepository](https://monorepo.tools/) which means this contains many sub-packages that composes full Fleet SDK implementation.

| Package                               | Description                                                                                  |                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [@fleet-sdk/core](/packages/core/)    | Core library with transaction builder and basic serialization.                               | [![npm](https://badgen.net/npm/v/@fleet-sdk/core)](https://www.npmjs.com/package/@fleet-sdk/core)     |
| @fleet-sdk/wallet                     | Wallet related library, with wallet creation, derivation and signing.                        | `not implemented`                                                                                     |
| @fleet-sdk/interpreter                | Sigma state interpreter and serialization library powered by Sigma.JS.                       | `not implemented`                                                                                     |
| @fleet-sdk/compiler                   | ErgoScript compiler library powered by Sigma.JS.                                             | `not implemented`                                                                                     |
| @fleet-sdk/ergo-graphql-client        | Data client library for [ergo-graphql](https://github.com/capt-nemo429/ergo-graphql) server. | `not implemented`                                                                                     |
| @fleet-sdk/dapp-connector             | dApp Connector (EIP-12) client library.                                                      | `not implemented`                                                                                     |
| [@fleet-sdk/common](/packages/common) | Internal utility functions, constants and types shared across @fleet-sdk packages.           | [![npm](https://badgen.net/npm/v/@fleet-sdk/common)](https://www.npmjs.com/package/@fleet-sdk/common) |

## Plugins

| Package                                              | Description                                            |                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [@fleet-sdk/babel-fees-plugin](/plugins/babel-fees/) | Fleet SDK plugin and utility functions for Babel Fees. | [![npm](https://badgen.net/npm/v/@fleet-sdk/babel-fees-plugin)](https://www.npmjs.com/package/@fleet-sdk/babel-fees-plugin) |

## Examples of Fleet SDK Usage from Ergo Projects

- [Nautilus' internal transaction builder](https://github.com/capt-nemo429/nautilus-wallet/blob/master/src/api/ergo/transaction/txBuilder.ts#L95)
- [Ergonames SDK](https://github.com/ergonames/sdk/blob/master/tx-lib/index.js)
- [Stealth Address example implementation](https://github.com/ross-weir/ergo-stealth-address-example)
