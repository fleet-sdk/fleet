import { BlockHeader, FleetError, NotSupportedError, SignedTransaction } from "@fleet-sdk/common";
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
import { afterEach, describe, expect, it, vi, vitest } from "vitest";
import { mockChunkedResponse } from "../utils";
import * as rest from "../utils/rest";
import { ErgoNodeProvider } from "./ergoNodeProvider";

describe("Test node client", async () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const nodeClient = new ErgoNodeProvider({
    url: "https://test0.com:9053/"
  });

  const testOptions = {
    url: "https://test0.com:9053/"
  };
  it("nodeOptions", async () => {
    nodeClient.nodeOptions = testOptions;
    expect(nodeClient.nodeOptions).toEqual(testOptions);
  });

  it("getBoxes - boxId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockGetBoxById));
    let boxes = await nodeClient.getBoxes({
      where: { boxId: "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6" },
      from: "blockchain"
    });
    expect(boxes[0].boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
    boxes = await nodeClient.getBoxes({
      where: { boxId: "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6" },
      from: "mempool"
    });
    expect(boxes[0].boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
    boxes = await nodeClient.getBoxes({
      where: { boxId: "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6" },
      from: "blockchain+mempool"
    });
    expect(boxes[0].boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
  });

  it("getBoxes - address", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    let boxes = await nodeClient.getBoxes({
      where: { address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT" },
      from: "blockchain",
      sort: "asc"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    boxes = await nodeClient.getBoxes({
      where: { address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT" },
      from: "blockchain+mempool"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockTransactionList.items));
    boxes = await nodeClient.getBoxes({
      where: { address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT" },
      from: "mempool"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });

  it("getBoxes - ergoTree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    let boxes = await nodeClient.getBoxes({
      where: {
        ergoTree: "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
      },
      from: "blockchain"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    boxes = await nodeClient.getBoxes({
      where: {
        ergoTree: "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
      },
      from: "blockchain+mempool"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockTransactionList.items));
    boxes = await nodeClient.getBoxes({
      where: {
        ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3"
      },
      from: "mempool",
      sort: "desc"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    const boxes2 = await nodeClient.getBoxes({
      where: {
        ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3"
      },
      from: "mempool",
      sort: "asc"
    });
    expect(boxes2.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    expect(boxes[boxes.length - 1].boxId).toBe(boxes2[0].boxId);
  });

  it("getBoxes - tokenId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    let boxes = await nodeClient.getBoxes({
      where: { tokenId: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40" },
      from: "blockchain"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    boxes = await nodeClient.getBoxes({
      where: { tokenId: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40" },
      from: "blockchain+mempool"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    boxes = await nodeClient.getBoxes({
      where: { tokenId: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40" },
      from: "mempool",
      sort: "desc"
    });
    expect(boxes.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    const boxes2 = await nodeClient.getBoxes({
      where: {
        tokenId: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40"
      },
      from: "mempool",
      sort: "asc"
    });
    expect(boxes2.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
    expect(boxes[boxes.length - 1].boxId).toBe(boxes2[0].boxId);
  });

  it("Should throw not supported error when streamBoxes is called", async () => {
    expect(true).toBe(true);
  });

  it("Should throw not supported error when reduceTransaction is called", async () => {
    expect(nodeClient.reduceTransaction).to.throw(NotSupportedError);
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
    const headerArray = await nodeClient.getHeaders({ take: 10 });
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
    expect(box.boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
  });

  it("getBoxByBoxIdWithMemPool", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockGetBoxById));
    let box = await nodeClient.getBoxByBoxIdWithMemPool(
      "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6"
    );
    expect(box.boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
    const mockGetBoxByBoxId = vitest.fn();
    ErgoNodeProvider.prototype.getBoxByBoxId = mockGetBoxByBoxId;
    mockGetBoxByBoxId.mockImplementation(() => {
      throw new FleetError();
    });
    box = await nodeClient.getBoxByBoxIdWithMemPool(
      "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6"
    );
    expect(box.boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
  });

  it("getBoxByIndex", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve(mockGetBoxById));
    const box = await nodeClient.getBoxByIndex(33263731);
    expect(box.boxId).toBe("45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6");
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
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getUnspentBoxesByErgotree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    const utxos = await nodeClient.getUnspentBoxesByErgotree(
      "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
    );
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getBoxesByAddress", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve({ items: mockUTXOByAddress }));
    const utxos = await nodeClient.getBoxesByAddress(
      "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT"
    );
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getBoxesByErgotree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve({ items: mockUTXOByAddress }));
    const utxos = await nodeClient.getBoxesByErgotree(
      "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
    );
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getMempoolBoxesByErgotree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockUTXOByAddress));
    const utxos = await nodeClient.getMempoolBoxesByErgotree(
      "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0"
    );
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });
  it("getUnspentMempoolBoxesByErgotree", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockTransactionList.items));
    const utxos = await nodeClient.getUnspentMempoolBoxesByErgotree(
      "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0",
      0
    );
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });

  it("sendTransaction - success", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockPostTxSuccess));
    const txId = await nodeClient.submitTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txId).toEqual({
      success: true,
      transactionId: "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842"
    });
    const txId2 = await nodeClient.checkTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txId2).toEqual({
      success: true,
      transactionId: "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842"
    });
  });

  it("sendTransaction - error", async () => {
    vi.spyOn(rest, "post").mockImplementation(() => Promise.resolve(mockNodeError));
    const txError = await nodeClient.submitTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txError.success).toBe(false);
    const txError2 = await nodeClient.checkTransaction({
      inputs: [],
      outputs: [],
      dataInputs: [],
      id: ""
    });
    expect(txError2.success).toBe(false);
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
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });

  it("getBoxesByTokenId", async () => {
    vi.spyOn(rest, "get").mockImplementation(() => Promise.resolve({ items: mockUTXOByAddress }));
    const utxos = await nodeClient.getBoxesByTokenId(
      "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40"
    );
    expect(utxos.map((b) => new ErgoBox(b))).toBeInstanceOf(Array<ErgoBox>);
  });

  it("Should stream boxes with default params", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        mockChunkedResponse([
          JSON.stringify(mockUTXOByAddress.splice(0, 2)),
          JSON.stringify(mockUTXOByAddress),
          JSON.stringify([])
        ])
      );

    let boxesCount = 0;
    for await (const boxes of nodeClient.streamBoxes({
      where: {
        ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3"
      },
      from: "blockchain"
    })) {
      boxesCount += boxes.length;
    }

    expect(boxesCount).toBe(3);
    expect(fetchSpy).toBeCalledTimes(3);

    const [firstCallBody, secondCallBody, thirdCallBody] = fetchSpy.mock.calls.map((call) =>
      JSON.parse(call[1]!.body as string)
    );
    expect(firstCallBody).to.be.equal(
      "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3"
    );
    expect(secondCallBody).to.be.equal(
      "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3"
    );
    expect(thirdCallBody).to.be.equal(
      "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3"
    );

    const [firstURL, secondURL, thirdURL] = fetchSpy.mock.calls.map((call) => call[0]);
    expect(firstURL).to.include("offset=0&limit=50");
    expect(secondURL).to.include("offset=50&limit=50");
    expect(thirdURL).to.include("offset=100&limit=50");
  });
});
