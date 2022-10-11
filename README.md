

# @fleet-sdk/core [![Checks](https://badgen.net/github/checks/fleet-sdk/core/master)](https://github.com/fleet-sdk/core/actions) [![Coverage](https://app.codecov.io/gh/fleet-sdk/core/branch/master/graph/badge.svg)](https://app.codecov.io/gh/fleet-sdk/core) [![License](https://badgen.net/github/license/fleet-sdk/core/)](https://github.com/fleet-sdk/core/blob/master/LICENSE)  [![npm](https://badgen.net/npm/v/@fleet-sdk/core)](https://www.npmjs.com/package/@fleet-sdk/core)

Easely create Ergo transactions with a pure JS library.

 * 🪄 Easy to use
 * 🪶 Lightweight: only 37.3kB minified + gziped
 * 🦾 Powerful: easely create complex transactions with a fluent API
 * 🧪 100% code coverage
 * 🌲 Tree-shakeable
 
 

# Usage
 
## Installation

```
npm install @fleet-sdk/core
```

## Building a simple transaction

```ts
const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(new OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"))
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```
