# @fleet-sdk/babel-fees-plugin [![License](https://badgen.net/github/license/fleet-sdk/fleet/)](https://github.com/fleet-sdk/fleet/blob/master/LICENSE) [![npm](https://badgen.net/npm/v/@fleet-sdk/babel-fees-plugin)](https://www.npmjs.com/package/@fleet-sdk/babel-fees-plugin)

Fleet SDK plugin and utility functions for Babel Fees.

## Installation

```bash
npm install @fleet-sdk/babel-fees-plugin
```

## Usage Example

```ts
const tx = new TransactionBuilder(height)
  .from(inputs)
  // Use extend method to extend the transaction builder with plugins.
  .extend(
    // In this case, BabelSwapPlugin will swap the specified token
    // amount for ERG, based on token price, and make it available.
    // for use in the transaction.
    BabelSwapPlugin(babelBox, {
      tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
      amount: "2" // amount of token units you want to swap for ERG
    })
  )
  // BabelSwapPlugin will make swapped ERG available for use in any
  // point of the transaction, in this example, we are using it to
  // pay the mining fee and sending the excess to the change address.
  .payMinFee()
  .sendChangeTo(changeAddress)
  .build();
```
