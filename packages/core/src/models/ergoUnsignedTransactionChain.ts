import type { EIP12UnsignedTransaction, UnsignedTransaction } from "@fleet-sdk/common";
import type { ErgoUnsignedTransaction } from "./ergoUnsignedTransaction";

export class ErgoUnsignedTransactionChain {
  #entryPoint: ErgoUnsignedTransaction;

  constructor(entryPoint: ErgoUnsignedTransaction) {
    this.#entryPoint = entryPoint;
  }

  first(): ErgoUnsignedTransaction {
    return this.#entryPoint;
  }

  toArray() {
    let parent = this.#entryPoint;
    const chain = [parent];

    while (parent.child) {
      chain.push(parent.child);
      parent = parent.child;
    }

    return chain;
  }

  toEIP12Object(): EIP12UnsignedTransaction[] {
    return this.toArray().map((child) => child.toEIP12Object());
  }

  toPlainObject(): UnsignedTransaction[] {
    return this.toArray().map((child) => child.toPlainObject());
  }
}
