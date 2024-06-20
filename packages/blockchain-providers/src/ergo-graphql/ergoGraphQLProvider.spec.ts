import { Header } from "@ergo-graphql/types";
import { chunk, hasDuplicatesBy, NotSupportedError } from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import { mockedGraphQLBoxes } from "_test-vectors";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChainProviderBox } from "../types/blockchainProvider";
import { mockChunkedResponse, mockResponse } from "../utils";
import { ErgoGraphQLProvider } from "./ergoGraphQLProvider";
import {
  ALL_BOXES_QUERY,
  CONF_BOXES_QUERY,
  UNCONF_BOXES_QUERY
} from "./queries";

function encodeSuccessResponseData<T>(data: T): string {
  return JSON.stringify({ data });
}

describe("ergo-graphql provider", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Fetch unspent boxes", () => {
    const _dumbWhere = { boxId: "" };
    const _dumbQuery = { where: _dumbWhere };
    const _client = new ErgoGraphQLProvider("https://gql.example.com/");
    const _boxId = (box: { boxId: string }) => box.boxId;

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("Should map query arguments to GraphQL variables", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(mockResponse(mockedResponse));

      await _client.getBoxes({
        where: {
          boxId: "boxId",
          ergoTree: "ergoTree",
          templateHash: "templateHash",
          tokenId: "tokenId"
        }
      });

      let call = JSON.parse(fetchSpy.mock.lastCall?.[1]?.body as string);
      expect(call.variables).to.be.deep.equal({
        spent: false,
        boxIds: ["boxId"],
        ergoTrees: ["ergoTree"],
        ergoTreeTemplateHash: "templateHash",
        tokenId: "tokenId",
        skip: 0,
        take: 50
      });

      await _client.getBoxes({
        where: {
          boxIds: ["boxId_1", "boxId_2"],
          ergoTrees: ["contract", "another_contract"]
        }
      });

      call = JSON.parse(fetchSpy.mock.lastCall?.[1]?.body as string);
      expect(call.variables).to.be.deep.equal({
        spent: false,
        boxIds: ["boxId_1", "boxId_2"],
        ergoTrees: ["contract", "another_contract"],
        skip: 0,
        take: 50
      });
    });

    it("Should map and deduplicate multiple element query fields", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(mockResponse(mockedResponse));

      await _client.getBoxes({
        where: {
          boxIds: ["boxId_0", "boxId_1"],
          boxId: "boxId_0",
          ergoTrees: ["ergoTree_0", "ergoTree_1", "ergoTree_1"],
          ergoTree: "ergoTree_2"
        }
      });

      const call = JSON.parse(fetchSpy.mock.lastCall?.[1]?.body as string);
      expect(call.variables).to.be.deep.equal({
        spent: false,
        boxIds: ["boxId_0", "boxId_1"],
        ergoTrees: ["ergoTree_0", "ergoTree_1", "ergoTree_2"],
        skip: 0,
        take: 50
      });
    });

    it("Should merge and deduplicate queries when ergoTree[s] and address[es] are present", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(mockResponse(mockedResponse));
      const tree0 =
        "0008cd02c1d434dac8765fc1269af82958d8aa350da53907096b35f7747cc372a7e6e69d";
      const tree1 =
        "0008cd02c6ef80b5a3f433b3c315943ece9335e1b5ff531c47f09c962d7d7c885370c0b2";
      const tree2 =
        "0008cd03479af981aac1aa68bf10cc7d934f42193b3b796055cd9ef581ab377395496bdb";
      const tree3 =
        "0008cd03d3a3ee637d3883ccaa231b882d090550b07a149131c52bf54f27551a266cf7af";
      const ergoTrees = [tree0, tree1, tree2, tree3];

      await _client.getBoxes({
        where: {
          ergoTrees: [tree0], // unique
          ergoTree: tree2, // duplicated
          addresses: [
            ErgoAddress.fromErgoTree(tree3).toString(), // unique
            ErgoAddress.fromErgoTree(tree2) // duplicated
          ],
          address: ErgoAddress.fromErgoTree(tree1) // unique
        }
      });

      let call = JSON.parse(fetchSpy.mock.lastCall?.[1]?.body as string);
      expect(call.variables.ergoTrees).to.have.all.members(ergoTrees);

      await _client.getBoxes({
        where: {
          addresses: [
            ErgoAddress.fromErgoTree(tree0),
            ErgoAddress.fromErgoTree(tree1),
            ErgoAddress.fromErgoTree(tree2),
            ErgoAddress.fromErgoTree(tree2)
          ],
          address: ErgoAddress.fromErgoTree(tree3).toString()
        }
      });

      call = JSON.parse(fetchSpy.mock.lastCall?.[1]?.body as string);
      expect(call.variables.ergoTrees).to.have.all.members(ergoTrees);
    });

    it("Should throw if not where clause is provided", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse(mockedResponse)
      );

      await expect(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        async () => await _client.getBoxes({ where: undefined } as any)
      ).rejects.toThrowError(
        "Cannot fetch unspent boxes without a where clause."
      );
    });

    it("Should fetch boxes with default params", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(mockResponse(mockedResponse));

      expect(mockedData.boxes).to.have.length(2);
      expect(mockedData.mempool.boxes).to.have.length(2);

      const response = await _client.getBoxes(_dumbQuery);
      expect(response).to.have.length(4);
      expect(response.map(_boxId)).to.have.members(
        mockedData.boxes.concat(mockedData.mempool.boxes).map(_boxId)
      );

      const confirmed = response.filter((b) => b.confirmed);
      expect(confirmed).to.have.length(mockedData.boxes.length);
      expect(confirmed.map(_boxId)).to.have.members(
        mockedData.boxes.map(_boxId)
      );

      // should include mempool boxes
      const unconfirmed = response.filter((b) => !b.confirmed);
      expect(unconfirmed).to.have.length(mockedData.mempool.boxes.length);
      expect(unconfirmed.map(_boxId)).to.have.members(
        mockedData.mempool.boxes.map(_boxId)
      );

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it("Should deduplicate boxes if response contains duplicated", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(0, 4) }
      };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(mockResponse(mockedResponse));

      expect(mockedData.boxes).to.have.length(2);
      expect(mockedData.mempool.boxes).to.have.length(4);

      const response = await _client.getBoxes(_dumbQuery);
      expect(response).to.have.length(4);

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it("Should return empty array when response is empty", async () => {
      const mockedData = { boxes: [], mempool: { boxes: [] } };
      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(mockResponse(mockedResponse));

      const response = await _client.getBoxes(_dumbQuery);
      expect(response).to.be.empty;

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it("Should exclude beingSpent if from = 'blockchain+mempool' or undefined", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      mockedData.boxes[0].beingSpent = true;
      mockedData.mempool.boxes[0].beingSpent = true;

      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(mockResponse(mockedResponse));

      expect(mockedData.boxes).to.have.length(2);
      expect(mockedData.mempool.boxes).to.have.length(2);

      const response = await _client.getBoxes(_dumbQuery);
      expect(response).to.have.length(2);

      expect(response.map(_boxId)).not.to.contain(mockedData.boxes[0].boxId);
      expect(response.map(_boxId)).not.to.contain(
        mockedData.mempool.boxes[0].boxId
      );

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it("Should fetch from blockchain only when `from: 'blockchain'`", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(2, 4) }
      };
      // this should be ignored for this case, as it's not a mempool aware operation
      mockedData.boxes[0].beingSpent = true;

      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(mockResponse(mockedResponse));

      expect(mockedData.boxes).to.have.length(2);
      expect(mockedData.mempool.boxes).to.have.length(2);

      const response = await _client.getBoxes({
        from: "blockchain",
        where: _dumbWhere
      });
      expect(response).to.have.length(2);

      expect(response.map(_boxId)).to.have.all.members(
        mockedData.boxes.map(_boxId)
      );
      expect(response.map(_boxId)).not.to.have.members(
        mockedData.mempool.boxes.map(_boxId)
      );

      expect(fetchSpy).toHaveBeenCalledOnce();

      const call = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(call.query).to.be.equal(CONF_BOXES_QUERY); // from: "blockchain"
    });

    it("Should fetch from mempool only when `from: 'mempool'`", async () => {
      const mockedData = {
        boxes: mockedGraphQLBoxes.slice(0, 2),
        mempool: { boxes: mockedGraphQLBoxes.slice(10, 12) }
      };

      const mockedResponse = encodeSuccessResponseData(mockedData);
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(mockResponse(mockedResponse));

      expect(mockedData.boxes).to.have.length(2);
      expect(mockedData.mempool.boxes).to.have.length(2);

      const response = await _client.getBoxes({
        from: "mempool",
        where: _dumbWhere
      });
      expect(response).to.have.length(2);

      expect(response.map(_boxId)).not.to.have.members(
        mockedData.boxes.map(_boxId)
      );
      expect(response.map(_boxId)).to.have.all.members(
        mockedData.mempool.boxes.map(_boxId)
      );

      expect(fetchSpy).toHaveBeenCalledOnce();
      const call = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(call.query).to.be.equal(UNCONF_BOXES_QUERY); // from: "mempool"
    });

    it("Should stream boxes with default params with more confirmed boxes than unconfirmed", async () => {
      const pageSize = 50;
      const chunks = chunk(mockedGraphQLBoxes, pageSize);
      const [conf0, conf1, conf2, mempool] = chunks;

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
        mockChunkedResponse([
          encodeSuccessResponseData({
            boxes: conf0,
            mempool: { boxes: mempool }
          }),
          encodeSuccessResponseData({
            boxes: conf1,
            mempool: { boxes: [] }
          }),
          encodeSuccessResponseData({
            boxes: conf2,
            mempool: { boxes: [] }
          }),
          encodeSuccessResponseData({
            boxes: [],
            mempool: { boxes: [] }
          })
        ])
      );

      let boxesCount = 0;
      for await (const boxes of _client.streamBoxes(_dumbQuery)) {
        boxesCount += boxes.length;
      }

      expect(boxesCount).to.be.equal(
        mockedGraphQLBoxes.filter((x) => !x.beingSpent).length
      );
      expect(fetchSpy).toBeCalledTimes(4);

      const [firstCall, secondCall, thirdCall, fourthCall] =
        fetchSpy.mock.calls.map((call) => JSON.parse(call[1]?.body as string));
      expect(firstCall.query).to.be.equal(ALL_BOXES_QUERY);
      expect(firstCall.variables.skip).to.be.equal(0);

      expect(secondCall.query).to.be.equal(ALL_BOXES_QUERY);
      expect(secondCall.variables.skip).to.be.equal(50);

      expect(thirdCall.query).to.be.equal(CONF_BOXES_QUERY);
      expect(thirdCall.variables.skip).to.be.equal(100);

      expect(fourthCall.query).to.be.equal(CONF_BOXES_QUERY);
      expect(fourthCall.variables.skip).to.be.equal(150);
    });

    it("Should stream boxes with default params with more unconfirmed boxes than confirmed", async () => {
      const pageSize = 50;
      const chunks = chunk(mockedGraphQLBoxes, pageSize);
      const [mem1, mem2, mem3, conf] = chunks;

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
        mockChunkedResponse([
          encodeSuccessResponseData({
            boxes: conf,
            mempool: { boxes: mem1 }
          }),
          encodeSuccessResponseData({
            boxes: [],
            mempool: { boxes: mem2 }
          }),
          encodeSuccessResponseData({
            boxes: [],
            mempool: { boxes: mem3 }
          }),
          encodeSuccessResponseData({
            boxes: [],
            mempool: { boxes: [] }
          })
        ])
      );

      let boxesCount = 0;
      for await (const boxes of _client.streamBoxes(_dumbQuery)) {
        boxesCount += boxes.length;
      }

      expect(boxesCount).to.be.equal(
        mockedGraphQLBoxes.filter((x) => !x.beingSpent).length
      );
      expect(fetchSpy).toBeCalledTimes(4);

      const [firstCall, secondCall, thirdCall, fourthCall] =
        fetchSpy.mock.calls.map((call) => JSON.parse(call[1]?.body as string));
      expect(firstCall.query).to.be.equal(ALL_BOXES_QUERY);
      expect(firstCall.variables.skip).to.be.equal(0);

      expect(secondCall.query).to.be.equal(ALL_BOXES_QUERY);
      expect(secondCall.variables.skip).to.be.equal(50);

      expect(thirdCall.query).to.be.equal(UNCONF_BOXES_QUERY);
      expect(thirdCall.variables.skip).to.be.equal(100);

      expect(fourthCall.query).to.be.equal(UNCONF_BOXES_QUERY);
      expect(fourthCall.variables.skip).to.be.equal(150);
    });

    /**
     * boxes can be moved from the mempool to the blockchain while streaming,
     * so we need to filter out boxes that have already been returned.
     */
    it("Should not return duplicated boxes", async () => {
      const pageSize = 50;
      const chunks = chunk(mockedGraphQLBoxes, pageSize);
      const [conf0, conf1, conf2, mempool] = chunks;

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
        mockChunkedResponse([
          encodeSuccessResponseData({
            boxes: conf0,
            mempool: { boxes: mempool }
          }),
          encodeSuccessResponseData({
            boxes: conf1,
            mempool: { boxes: [] }
          }),
          encodeSuccessResponseData({
            boxes: conf2,
            mempool: { boxes: [] }
          }),
          encodeSuccessResponseData({
            // move 2 boxes from mempool to blockchain, thus they should be filtered out,
            // as they were already returned in the first chunk
            boxes: mempool,
            mempool: { boxes: [] }
          }),
          encodeSuccessResponseData({
            boxes: [],
            mempool: { boxes: [] }
          })
        ])
      );

      let allBoxes: ChainProviderBox[] = [];
      for await (const boxes of _client.streamBoxes(_dumbQuery)) {
        allBoxes = allBoxes.concat(boxes);
      }

      expect(hasDuplicatesBy(allBoxes, (box) => box.boxId)).to.be.false;
      expect(allBoxes).to.have.length(
        mockedGraphQLBoxes.filter((x) => !x.beingSpent).length
      );
      expect(fetchSpy).toBeCalledTimes(5);
    });
  });

  it("Should fetch LastHeaders with default params", async () => {
    const mockData =
      '{"data":{"blockHeaders":[{"headerId":"d49","timestamp":"169","version":3,"adProofsRoot":"534","stateRoot":"19e","transactionsRoot":"330","nBits":"117","extensionHash":"062","powSolutions":{"pk":"027","w":"027","n":"ba9","d":"0"},"height":1100449,"difficulty":"220","parentId":"90a","votes":[0,0,0]},{"headerId":"90a","timestamp":"169","version":3,"adProofsRoot":"d97","stateRoot":"e1a","transactionsRoot":"a28","nBits":"117","extensionHash":"062","powSolutions":{"pk":"030","w":"027","n":"5e4","d":"0"},"height":1100448,"difficulty":"220","parentId":"802","votes":[0,0,0]}]}}';
    const mockDataJSON = JSON.parse(mockData);
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLProvider("https://gql.example.com/");
    const response = await client.getHeaders({ take: 2 });
    expect(response.length).to.be.equal(2);
    expect(response).to.deep.equal(
      mockDataJSON.data.blockHeaders.map((header: Header) => ({
        ...header,
        id: header.headerId,
        nBits: Number(header.nBits),
        timestamp: Number(header.timestamp),
        votes: header.votes.join("")
      }))
    );
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("Should create a custom GraphQL operation", async () => {
    const url = "https://gql.example.com/";
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        mockResponse('{"data":{"state":{"height":1098787}}}')
      );
    const client = new ErgoGraphQLProvider(url);

    const operation = client.createOperation("query test { state { height } }");

    const response = await operation();
    expect(response.data).to.be.deep.equal({ state: { height: 1098787 } });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy.mock.calls[0][0]).to.be.equal(url);
  });

  it("Should return empty LastHeaders when response is corrupted", async () => {
    const mockData = "{}";
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLProvider("https://gql.example.com/");
    const response = await client.getHeaders({ take: 2 });
    expect(response).to.deep.equal([]);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("Should return true when transaction is valid", async () => {
    const mockData = '{"data":{"checkTransaction": "txId"}}';
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLProvider("https://gql.example.com/");
    const response = await client.checkTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.deep.equal({ success: true, transactionId: "txId" });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("Should return false when transaction is invalid", async () => {
    const mockData = '{"errors":[{"message":"Transaction is invalid"}]}';
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLProvider("https://gql.example.com/");
    const response = await client.checkTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.deep.equal({
      success: false,
      message: "Transaction is invalid"
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("Should return txId that is returned by the node", async () => {
    const mockData = '{"data":{"submitTransaction": "txId"}}';
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLProvider("https://gql.example.com/");
    const response = await client.submitTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.deep.equal({ success: true, transactionId: "txId" });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("Should return error when an error occurs on transaction submitting", async () => {
    const mockData =
      '{"errors":[{"message":"Transaction not accepted by the node"}]}';
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLProvider("https://gql.example.com/");
    const response = await client.submitTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.deep.equal({
      success: false,
      message: "Transaction not accepted by the node"
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("Should throw not supported error when reduceTransaction is called", async () => {
    const client = new ErgoGraphQLProvider({ url: "https://gql.example.com/" });
    expect(client.reduceTransaction).to.throw(NotSupportedError);
  });
});
