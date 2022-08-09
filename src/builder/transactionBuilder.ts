import {
  Amount,
  Box,
  BoxCandidate,
  DataInput,
  EIP12UnsignedTransaction,
  UnsignedInput,
  UnsignedTransaction
} from "../types";
import { OutputBuilder } from "./outputBuilder";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

export class TransactionBuilder {
  public from(
    inputs: UnsignedInput[] | Box<Amount>[] | BoxCandidate<Amount>[]
  ): TransactionBuilder {
    throw Error("Not implemented");
  }

  public to(outputs: OutputBuilder[]): TransactionBuilder {
    throw Error("Not implemented");
  }

  public useDataInputs(dataInputs: DataInput[] | UnsignedInput[]): TransactionBuilder {
    throw Error("Not implemented");
  }

  public payFee(amount: Amount): TransactionBuilder {
    throw Error("Not implemented");
  }

  public configure(
    callback: (settings: TransactionBuilderSettings) => TransactionBuilderSettings
  ): TransactionBuilder {
    throw Error("Not implemented");
  }

  public build(): UnsignedTransaction {
    throw Error("Not implemented");
  }

  public buildAsEip12(): EIP12UnsignedTransaction {
    throw Error("Not implemented");
  }
}
