import { Box, Header } from "@ergo-graphql/types";
import { NotSupportedError } from "@fleet-sdk/common";
import { describe, expect, it, vi } from "vitest";
import { ErgoGraphQLClient } from "./ergoGraphQLClient";
import { mockResponse } from "./utils";

describe("Graphql Client", () => {
  /**
   * @description For testing UnspentBoxes function of ErgoGraphQLClient
   * @expected it should return correct array of boxes based on mock data
   */
  it("Should fetch UnspentBoxes with default params", async () => {
    const mockData =
      '{"data":{"boxes":[{"boxId":"187","transactionId":"15f","index":0,"value":"20000000","creationHeight":1099205,"ergoTree":"1002","assets":[],"additionalRegisters":{}},{"boxId":"9bd","transactionId":"b14","index":2,"value":"61755633852","creationHeight":1099203,"ergoTree":"0008","assets":[{"tokenId":"c0b","amount":"40"},{"tokenId":"0fd","amount":"69"},{"tokenId":"077","amount":"2000"}],"additionalRegisters":{}}]}}';
    const mockDataJSON = JSON.parse(mockData);
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.getUnspentBoxes({
      where: {
        boxIds: [""]
      }
    });
    expect(response.length).to.be.equal(2);
    expect(response).to.deep.equal(
      mockDataJSON.data.boxes.map((box: Box) => ({
        ...box,
        assets: box.assets.map((asset) => ({
          tokenId: asset.tokenId,
          amount: BigInt(asset.amount)
        })),
        confirmed: true,
        value: BigInt(box.value)
      }))
    );
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing UnspentBoxes function of ErgoGraphQLClient
   * @expected it should return correct array of boxes based on mock data
   */
  it("Should fetch UnspentBoxes when filtering contract", async () => {
    const mockData =
      '{"data":{"boxes":[{"boxId":"187","transactionId":"15f","index":0,"value":"20000000","creationHeight":1099205,"ergoTree":"1002","assets":[],"additionalRegisters":{}}]}}';
    const mockDataJSON = JSON.parse(mockData);
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.getUnspentBoxes({
      where: {
        contract: "1002"
      }
    });
    expect(response.length).to.be.equal(1);
    expect(response).to.deep.equal(
      mockDataJSON.data.boxes.map((box: Box) => ({
        ...box,
        assets: box.assets.map((asset) => ({
          tokenId: asset.tokenId,
          amount: BigInt(asset.amount)
        })),
        confirmed: true,
        value: BigInt(box.value)
      }))
    );
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing UnspentBoxes function of ErgoGraphQLClient
   * @expected it should return empty array when response is empty
   */
  it("Should return empty UnspentBoxes when response is corrupted", async () => {
    const mockData = "{}";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.getUnspentBoxes({
      where: {
        template: "1002"
      }
    });
    expect(response).to.deep.equal([]);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing getLastHeaders function of ErgoGraphQLClient
   * @expected it should return correct array of headers based on mock data
   */
  it("Should fetch LastHeaders with default params", async () => {
    const mockData =
      '{"data":{"blockHeaders":[{"headerId":"d49","timestamp":"169","version":3,"adProofsRoot":"534","stateRoot":"19e","transactionsRoot":"330","nBits":"117","extensionHash":"062","powSolutions":{"pk":"027","w":"027","n":"ba9","d":"0"},"height":1100449,"difficulty":"220","parentId":"90a","votes":[0,0,0]},{"headerId":"90a","timestamp":"169","version":3,"adProofsRoot":"d97","stateRoot":"e1a","transactionsRoot":"a28","nBits":"117","extensionHash":"062","powSolutions":{"pk":"030","w":"027","n":"5e4","d":"0"},"height":1100448,"difficulty":"220","parentId":"802","votes":[0,0,0]}]}}';
    const mockDataJSON = JSON.parse(mockData);
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.getLastHeaders(2);
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

  /**
   * @description For testing getLastHeaders function of ErgoGraphQLClient
   * @expected it should return empty array when response is empty
   */
  it("Should return empty LastHeaders when response is corrupted", async () => {
    const mockData = "{}";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.getLastHeaders(2);
    expect(response).to.deep.equal([]);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing checkTransaction function of ErgoGraphQLClient
   * @expected it should return true when gql returns txId
   */
  it("checkTx sould return true when transaction is valid", async () => {
    const mockData = '{"data":{"checkTransaction": "txId"}}';
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.checkTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.true;
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing checkTransaction function of ErgoGraphQLClient
   * @expected it should return false when gql returns empty string
   */
  it("checkTx should return false when transaction is valid", async () => {
    const mockData = '{"data":{"checkTransaction": ""}}';
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.checkTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.false;
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing submitTransaction function of ErgoGraphQLClient
   * @expected it should return txId that is returned by the node
   */
  it("should return txId that is returned by the node", async () => {
    const mockData = '{"data":{"submitTransaction": "txId"}}';
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.submitTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.equal("txId");
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing submitTransaction function of ErgoGraphQLClient
   * @expected it should return empty string when gql returns empty response
   */
  it("should return empty string when node can't submit the transaction", async () => {
    const mockData = "{}";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse(mockData));

    const client = new ErgoGraphQLClient("https://gql.example.com/");
    const response = await client.submitTransaction({
      id: "txId",
      inputs: [],
      outputs: [],
      dataInputs: []
    });

    expect(response).to.be.equal("");
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  /**
   * @description For testing reduceTransaction function of ErgoGraphQLClient
   * @expected it should throw not supported error
   */
  it("should throw not supported error when reduceTransaction is called", async () => {
    const client = new ErgoGraphQLClient({ url: "https://gql.example.com/" });
    expect(client.reduceTransaction).to.throw(NotSupportedError);
  });
});
