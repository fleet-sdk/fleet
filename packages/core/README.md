# @fleet-sdk/core [![License](https://badgen.net/github/license/fleet-sdk/fleet/)](https://github.com/fleet-sdk/fleet/blob/master/LICENSE) [![npm](https://badgen.net/npm/v/@fleet-sdk/core)](https://www.npmjs.com/package/@fleet-sdk/core)

Easily write Ergo off-chain code with a lightweight and pure JS library.

- 🪄 Easy to use
- 🪶 Lightweight: [~15kB minified + gziped](https://bundlephobia.com/package/@fleet-sdk/core)
- 🦾 Powerful: easily create complex transactions with a fluent API
- 🧪 100% code coverage
- 🌲 Tree-shakeable

# Basic Usage

## Installation

```bash
npm install @fleet-sdk/core
```

## Building a simple transaction

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(new OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"))
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```

## Building a transaction with multiple outputs

To build a a transaction with multiple outputs you can simply pass an array of `OutputBuilder` as argument of `to()` method.

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to([
    new OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"),
    new OutputBuilder(2000000n, "9fhJkRaSoPfzE9rA3e4ptK51xvyNsLKonYN1xje5LWaLukx7iX2")
  ])
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```

## Sending tokens

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(
    new OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j").addTokens([
      { tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b", amount: 100n },
      { tokenId: "36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1", amount: 429n }
    ])
  )
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```

## Minting tokens

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(
    new OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j").mintToken({
      name: "TestToken",
      amount: 21000000n,
      decimals: 4,
      description: "Just a test token"
    })
  )
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```

## Burning tokens

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .burnTokens([
    { tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b", amount: 100n },
    { tokenId: "36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1", amount: 429n }
  ])
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```

## Ensuring input inclusion

You can use `configureSelector` method to ensure one or more inputs to be included in the transaction. Useful when working with contracts.

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const boxId = "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e";
const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(new OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"))
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .configureSelector((selector) => selector.ensureInclusion((input) => input.boxId === boxId))
  .payMinFee()
  .build();
```

## Examples of FLEET Usage from Ergo Projects

- [Nautilus' internal transaction builder](https://github.com/capt-nemo429/nautilus-wallet/blob/master/src/api/ergo/transaction/txBuilder.ts#L95)
- [Ergonames SDK](https://github.com/ergonames/sdk/blob/master/tx-lib/index.js)
