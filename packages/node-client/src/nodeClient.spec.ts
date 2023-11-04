import { BlockHeader, SignedTransaction } from "@fleet-sdk/common";
import { ErgoBox } from "@fleet-sdk/core";
import {
  mockCompileError,
  mockCompileScript,
  mockGetBalance,
  mockGetBoxById,
  mockIndexedHeight,
  mockLastHeaders,
  mockNodeError,
  mockNodeInfo,
  mockPostTxSuccess,
  mockTokenInfo,
  mockTransactionList,
  mockUTXOByAddress
} from "_test-vectors";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getNodeClient } from "./nodeClient";

import * as rest from "./utils/rest";

describe("Test node client", async () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const nodeClient = getNodeClient("https://test0.com");

  const testOptions = {
    url: "https://test.com"
  };
  it("nodeOptions", async () => {
    nodeClient.nodeOptions = testOptions;
    expect(nodeClient.nodeOptions).toEqual(testOptions);
  });

  it("getHeight", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockIndexedHeight));
    const height = await nodeClient.getCurrentHeight();
    expect(height).toBe(1125453);
    const indexedHeight = await nodeClient.getIndexedHeight();
    expect(indexedHeight).toBe(1125453);
  });

  it("getLastHeaders", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockLastHeaders));
    const headerArray = await nodeClient.getLastHeaders();
    expect(headerArray).toBeInstanceOf(Array<BlockHeader>);
    expect(headerArray.length).toBe(10);
  });

  it("addressHasTransactions - true", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockTransactionList));
    const addressWithTx = await nodeClient.addressHasTransactions(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT"
    );
    expect(addressWithTx).toBe(true);
  });

  it("getTransactionsByAddress", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockTransactionList));
    const tx = await nodeClient.getTransactionsByAddress(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
      5
    );
    expect(tx).toBeInstanceOf(Array<SignedTransaction>);
    expect(tx.length).toBe(5);
  });

  it("addressHasTransactions - false", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve([]));
    const addressWithoutTx = await nodeClient.addressHasTransactions(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT"
    );
    expect(addressWithoutTx).toBe(false);
  });

  it("getBoxByBoxId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockGetBoxById));
    const box = await nodeClient.getBoxByBoxId(
      "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6"
    );
    expect(box).toBeInstanceOf(ErgoBox);
  });

  it("getBoxByIndex", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockGetBoxById));
    const box = await nodeClient.getBoxByIndex(33263731);
    expect(box).toBeInstanceOf(ErgoBox);
  });

  it("getTransactionByTransactionId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockTransactionList.items[0]));
    const tx = await nodeClient.getTransactionByTransactionId(
      "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a"
    );
    expect(tx.id).toBeDefined();
  });

  it("getTransactionByTransactionId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockTransactionList.items[0]));
    const tx = await nodeClient.getTransactionByIndex(5631288);
    expect(tx.id).toBeDefined();
  });

  it("getBalanceByAddress - confirmed", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockGetBalance));
    const bal = await nodeClient.getBalanceByAddress(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT"
    );
    expect(bal.nanoERG).toBeDefined();
  });

  it("getBalanceByAddress - unconfirmed", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockGetBalance));
    const bal2 = await nodeClient.getBalanceByAddress(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
      false
    );
    expect(bal2.nanoERG).toBeDefined();
  });

  it("getTokenInfo", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockTokenInfo));
    const tokenInfo = await nodeClient.getTokenInfo(
      "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40"
    );
    expect(tokenInfo.name).toBe("kushti");
  });

  it("getNodeInfo", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockNodeInfo));
    const nodeInfo = await nodeClient.getNodeInfo();
    expect(nodeInfo.appVersion).toBeDefined();
  });

  it("compileErgoscript - success", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockCompileScript));
    const compiled = await nodeClient.compileErgoscript("HEIGHT > 100");
    if (compiled.address) {
      expect(compiled.address).toBe("5yE8zxMTsrGEPw5WM5ET");
    } else {
      expect(true).toBe(false);
    }
  });

  it("compileErgoscript - error", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockCompileError));
    const compileError = await nodeClient.compileErgoscript("HEIHT > 100");
    if (compileError.error) {
      expect(compileError.error).toBe(400);
    } else {
      expect(true).toBe(false);
    }
  });

  it("getUnspentBoxesByAddress", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    const utxos = await nodeClient.getUnspentBoxesByAddress(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT"
    );
    expect(utxos).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getUnspentBoxesByErgotree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    const utxos = await nodeClient.getUnspentBoxesByErgotree(
      "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
    );
    expect(utxos).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getBoxesByAddress", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve({ items: mockUTXOByAddress }));
    const utxos = await nodeClient.getBoxesByAddress(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT"
    );
    expect(utxos).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getBoxesByErgotree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve({ items: mockUTXOByAddress }));
    const utxos = await nodeClient.getBoxesByErgotree(
      "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
    );
    expect(utxos).toBeInstanceOf(Array<ErgoBox>);
  });

  it("sendTransaction - success", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockPostTxSuccess));
    const txId = await nodeClient.sendTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txId).toEqual({
      transactionId: "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842"
    });
    const txId2 = await nodeClient.checkTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txId2).toEqual({
      transactionId: "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842"
    });
  });

  it("sendTransaction - error", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockNodeError));
    const txError = await nodeClient.sendTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txError.error).toBe(400);
    const txError2 = await nodeClient.checkTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txError2.error).toBe(400);
  });

  it("getUnconfirmedTransactions", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockTransactionList.items));
    const unconfirmedTx = await nodeClient.getUnconfirmedTransactions();
    expect(unconfirmedTx).toBeInstanceOf(Array<SignedTransaction>);
  });

  it("getUnconfirmedTransactionsByTransactionId - success", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockTransactionList.items[0]));
    const tx = await nodeClient.getUnconfirmedTransactionsByTransactionId(
      "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842"
    );
    if (tx) {
      expect(tx.id).toBeDefined();
    } else {
      expect(true).toBe(false);
    }
  });

  it("getUnconfirmedTransactionsByTransactionId - error", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockNodeError));
    const tx = await nodeClient.getUnconfirmedTransactionsByTransactionId(
      "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842"
    );
    expect(tx).toBeUndefined();
  });

  it("getUnconfirmedTransactionsByErgoTree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockTransactionList.items));
    const unconfirmedTx = await nodeClient.getUnconfirmedTransactionsByErgoTree(
      "108a010400040004000e20b10b0001e...1273860193721b738701937227738801738901"
    );
    expect(unconfirmedTx).toBeInstanceOf(Array<SignedTransaction>);
  });

  it("getUnspentBoxesByTokenId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    const utxos = await nodeClient.getUnspentBoxesByTokenId(
      "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40"
    );
    expect(utxos).toBeInstanceOf(Array<ErgoBox>);
  });

  it("getBoxesByTokenId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve({ items: mockUTXOByAddress }));
    const utxos = await nodeClient.getBoxesByTokenId(
      "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40"
    );
    expect(utxos).toBeInstanceOf(Array<ErgoBox>);
  });
});
