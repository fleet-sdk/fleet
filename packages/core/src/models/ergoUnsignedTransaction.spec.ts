import { serializeTransaction } from "@fleet-sdk/serializer";
import { regularBoxes, validBoxes } from "_test-vectors";
import { mockedUnsignedTransactions } from "_test-vectors";
import { describe, expect, it } from "vitest";
import {
  FEE_CONTRACT,
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE,
  SAFE_MIN_BOX_VALUE,
  TransactionBuilder
} from "../builder";
import { ErgoUnsignedInput } from "./ergoUnsignedInput";
import { ErgoUnsignedTransaction } from "./ergoUnsignedTransaction";
import { ErgoBoxCandidate } from "./ergoBoxCandidate";
import { ErgoAddress } from "./ergoAddress";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import type {
  Box,
  DataInput,
  EIP12UnsignedDataInput,
  EIP12UnsignedInput,
  UnsignedInput,
  UnsignedTransaction
} from "@fleet-sdk/common";

describe("Model", () => {
  it("Should generate the right transactionId and boxIds for outputs", () => {
    for (const tx of mockedUnsignedTransactions) {
      const unsigned = new ErgoUnsignedTransaction(
        tx.inputs.map((input) => new ErgoUnsignedInput(input)),
        tx.dataInputs.map((dataInput) => new ErgoUnsignedInput(dataInput)),
        tx.outputs.map((output) => new ErgoBoxCandidate(output))
      );

      expect(unsigned.id).to.be.equal(tx.id);
      expect(unsigned.outputs.map((x) => x.boxId)).to.be.deep.equal(
        tx.outputs.map((x) => x.boxId)
      );
    }
  });

  it("Should serialize", () => {
    for (const tx of mockedUnsignedTransactions) {
      const unsigned = new ErgoUnsignedTransaction(
        tx.inputs.map((input) => new ErgoUnsignedInput(input)),
        tx.dataInputs.map((dataInput) => new ErgoUnsignedInput(dataInput)),
        tx.outputs.map((output) => new ErgoBoxCandidate(output))
      );

      expect(unsigned.toBytes()).toEqual(serializeTransaction(tx).toBytes());
    }
  });

  it("Should convert to plain object", () => {
    const transaction = new TransactionBuilder(1)
      .from(regularBoxes)
      .withDataFrom(regularBoxes[0])
      .to(
        new OutputBuilder(
          SAFE_MIN_BOX_VALUE,
          "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
        )
      )
      .payMinFee()
      .sendChangeTo("9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")
      .build();

    const plainObject = transaction.toPlainObject();

    expect(transaction.inputs.map((x) => x.boxId)).toEqual(
      plainObject.inputs.map((x) => x.boxId)
    );
    expect(transaction.dataInputs.map((x) => x.boxId)).toEqual(
      plainObject.dataInputs.map((x) => x.boxId)
    );
    expect(transaction.outputs.map((x) => x.ergoTree)).toEqual(
      plainObject.outputs.map((x) => x.ergoTree)
    );
  });

  it("Should calculate burning amount", () => {
    const tokensToBurn = [
      {
        tokenId: "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489",
        amount: 10n
      },
      {
        tokenId: "bf59773def7e08375a553be4cbd862de85f66e6dd3dccb8f87f53158f9255bf5",
        amount: 20n
      }
    ];

    const transaction = new TransactionBuilder(1)
      .from(regularBoxes)
      .burnTokens(tokensToBurn)
      .payMinFee()
      .sendChangeTo("9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")
      .build();

    expect(transaction.burning).toEqual({ nanoErgs: 0n, tokens: tokensToBurn });
  });

  it("Should filter change boxes", () => {
    const transaction = new TransactionBuilder(1)
      .from(regularBoxes)
      .withDataFrom(regularBoxes[0])
      .to(
        new OutputBuilder(
          SAFE_MIN_BOX_VALUE,
          "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
        )
      )
      .payMinFee()
      .sendChangeTo("9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")
      .build();

    expect(transaction.change).to.have.length(1);
  });
});

describe("Chaining", () => {
  const height = 12434;
  const value = SAFE_MIN_BOX_VALUE;
  const [address1, address2, address3] = [
    "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin",
    "9h9wCAdtnFbBoFQL6ePYNiz6SyAFpYWZX9VaBnyJj8BHzqx6yFn",
    "9fJCKJahBVQUKq8eR714YJu4Euds8nPTijBok3EDNzj49L8cACn"
  ].map(ErgoAddress.decode);

  it("Should chain transactions and include father change as child's input", () => {
    const chain = new TransactionBuilder(height)
      .from(regularBoxes)
      .to(new OutputBuilder(value, address1))
      .payMinFee()
      .sendChangeTo(address2)
      .build()
      .chain((builder) =>
        builder
          .to(new OutputBuilder(value, address3))
          .build()
          .chain((builder) => builder.to(new OutputBuilder(value, address3)).build())
      );

    const chainArray = chain.toArray();
    expect(chainArray).to.have.length(3);

    const [first, second, third] = chainArray;
    expect(first.outputs.map((x) => x.boxId)).to.containSubset(
      second.inputs.map((x) => x.boxId)
    );

    expect(second.outputs.map((x) => x.boxId)).to.containSubset(
      third.inputs.map((x) => x.boxId)
    );
  });

  it("Should chain transactions and override change address and fee from the father to all children", () => {
    const feeValue = RECOMMENDED_MIN_FEE_VALUE * 2n;

    const chain = new TransactionBuilder(height)
      .from(regularBoxes)
      .to(new OutputBuilder(value, address1))
      .payFee(feeValue)
      .sendChangeTo(address2)
      .build()
      .chain((builder) =>
        builder
          .to(new OutputBuilder(value, address3))
          .build()
          .chain((b) =>
            b
              .to(new OutputBuilder(value, address1))
              .build()
              .chain((b) => b.to(new OutputBuilder(value, address2)).build())
          )
      );

    const chainArray = chain.toArray();
    expect(chainArray).to.have.length(4);

    const feeOutputs = chainArray
      .flatMap((x) => x.outputs)
      .filter((x) => x.ergoTree === FEE_CONTRACT);
    expect(feeOutputs).to.have.length(4);
    expect(feeOutputs.every((x) => x.value === feeValue)).to.be.true;

    const changeOutputs = chainArray.flatMap((x) => x.change);
    expect(changeOutputs.every((x) => x.ergoTree === address2.ergoTree)).to.be.true;
  });

  it("Should chain transactions and customize fee and change address", () => {
    const feeValue = RECOMMENDED_MIN_FEE_VALUE * 2n;
    const chain = new TransactionBuilder(height)
      .from(regularBoxes)
      .to(new OutputBuilder(value, address1))
      .payFee(feeValue)
      .sendChangeTo(address2)
      .build()
      .chain((builder) =>
        builder
          .to(new OutputBuilder(value, address3))
          .payMinFee()
          .build()
          .chain((b) =>
            b
              .to(new OutputBuilder(value, address1))
              .sendChangeTo(address3)
              .build()
              .chain((b) => b.to(new OutputBuilder(value, address2)))
          )
      );

    const chainArray = chain.toArray();
    expect(chainArray).to.have.length(4);

    const feeOutputs = chainArray
      .flatMap((x) => x.outputs)
      .filter((x) => x.ergoTree === FEE_CONTRACT);
    expect(feeOutputs).to.have.length(4);
    expect(feeOutputs[0].value).to.be.equal(feeValue);
    expect(feeOutputs[1].value).to.be.equal(RECOMMENDED_MIN_FEE_VALUE);
    expect(feeOutputs[2].value).to.be.equal(RECOMMENDED_MIN_FEE_VALUE);
    expect(feeOutputs[3].value).to.be.equal(RECOMMENDED_MIN_FEE_VALUE);

    const changeOutputs = chainArray.flatMap((x) => x.change);
    expect(changeOutputs).to.have.length(4);
    expect(changeOutputs[0].ergoTree).to.be.equal(address2.ergoTree);
    expect(changeOutputs[1].ergoTree).to.be.equal(address2.ergoTree);
    expect(changeOutputs[2].ergoTree).to.be.equal(address3.ergoTree);
    expect(changeOutputs[2].ergoTree).to.be.equal(address3.ergoTree);
  });

  it("Should convert to plain object", () => {
    const computeId = (tx: UnsignedTransaction) =>
      hex.encode(blake2b256(serializeTransaction(tx).toBytes()));
    const isEip12Input = (
      x: UnsignedInput | EIP12UnsignedDataInput | EIP12UnsignedInput | DataInput
    ): x is EIP12UnsignedInput =>
      "value" in x && "additionalRegisters" && "ergoTree" in x && "assets" in x;

    const chain = new TransactionBuilder(height)
      .from(regularBoxes)
      .to(new OutputBuilder(value, address1))
      .withDataFrom(validBoxes[0])
      .payMinFee()
      .sendChangeTo(address2)
      .build()
      .chain((b) => b.to(new OutputBuilder(value, address3)).payMinFee());

    const chainArray = chain.toArray();
    const nodeTxns = chain.toPlainObject();
    const eip12Txns = chain.toEIP12Object();

    // check correctness of ids
    for (let i = 0; i < chainArray.length; i++) {
      expect(computeId(nodeTxns[i])).to.be.equal(chainArray[i].id);
      expect(computeId(eip12Txns[i])).to.be.equal(chainArray[i].id);
    }

    // check object structure
    expect(nodeTxns.flatMap((x) => x.inputs).every((x) => !isEip12Input(x))).to.be.true;
    expect(nodeTxns.flatMap((x) => x.dataInputs).every((x) => !isEip12Input(x))).to.be
      .true;

    expect(eip12Txns.flatMap((x) => x.inputs).every(isEip12Input)).to.be.true;
    expect(eip12Txns.flatMap((x) => x.dataInputs).every(isEip12Input)).to.be.true;
  });

  it("Should fail when trying to chain without the parent builder", () => {
    const tx = new TransactionBuilder(height)
      .from(regularBoxes)
      .to(new OutputBuilder(value, address1))
      .withDataFrom(validBoxes[0])
      .payMinFee()
      .sendChangeTo(address2)
      .build();

    const noParentBuilderTx = new ErgoUnsignedTransaction(
      tx.inputs,
      tx.dataInputs,
      tx.outputs.map((x) => x.toCandidate())
    );

    expect(() =>
      noParentBuilderTx.chain((b) => b.to(new OutputBuilder(value, address3)).payMinFee())
    ).to.throw("Cannot chain transactions without a parent TransactionBuilder");
  });
});
