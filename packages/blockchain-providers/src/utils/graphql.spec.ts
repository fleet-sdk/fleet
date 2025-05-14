import type { Box, QueryBoxesArgs, State } from "@ergo-graphql/types";
import { BlockchainProviderError } from "@fleet-sdk/common";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { resolveString } from "./_tests";
import {
  type GraphQLOperation,
  type GraphQLSuccessResponse,
  type GraphQLVariables,
  createGqlOperation,
  getOpName,
  gql
} from "./graphql";

const DEFAULT_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  accept: "application/graphql-response+json, application/json"
};

describe("GraphQL query builder", () => {
  const parseSpy = vi.spyOn(JSON, "parse");
  const stringifySpy = vi.spyOn(JSON, "stringify");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Should fetch results with default params", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(resolveString('{"data":{"state":{"height":1098787}}}'));

    const query = gql`
      query test {
        state {
          height
        }
      }
    `;
    const getBoxes = createGqlOperation<{ state: State }>(query, {
      url: "https://gql.example.com/"
    });

    const response = await getBoxes();

    expect(response.data).to.be.deep.equal({ state: { height: 1098787 } });
    expect(parseSpy).toHaveBeenCalledOnce();
    expect(stringifySpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith("https://gql.example.com/", {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        operationName: getOpName(query),
        query
      })
    });
  });

  it("Should fetch results with default params and override url", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(resolveString('{"data":{"state":{"height":1098787}}}'));

    const query = gql`
      query test {
        state {
          height
        }
      }
    `;
    const getBoxes = createGqlOperation<{ state: State }>(query, {
      url: "https://gql.example.com/"
    });
    const response = await getBoxes(undefined, "https://gql.example2.com/");

    expect(response.data).to.be.deep.equal({ state: { height: 1098787 } });
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith("https://gql.example2.com/", {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        operationName: getOpName(query),
        query
      })
    });
  });

  it("Should fetch results with default params and set url on operation call", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(resolveString('{"data":{"state":{"height":1098787}}}'));

    const query = gql`
      query test {
        state {
          height
        }
      }
    `;
    const getBoxes = createGqlOperation<{ state: State }>(query);
    const response = await getBoxes(undefined, "https://gql.example3.com/");

    expect(response.data).to.be.deep.equal({ state: { height: 1098787 } });
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith("https://gql.example3.com/", {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        operationName: getOpName(query),
        query
      })
    });
  });

  it("Should throw if not url is set", async () => {
    const query = gql`
      query test {
        state {
          height
        }
      }
    `;
    const getBoxes = createGqlOperation<{ state: State }>(query, {});
    await expect(getBoxes()).rejects.toThrowError("URL is required");
  });

  it("Should fetch results and retry on failure", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValue(resolveString('{"data":{"state":{"height":1098787}}}'));

    const query = gql`
      query test {
        state {
          height
        }
      }
    `;
    const getBoxes = createGqlOperation<{ state: State }>(query, {
      url: "https://gql.example.com/",
      retry: { attempts: 3, delay: 5 }
    });

    const response = await getBoxes();

    expect(response.data).to.be.deep.equal({ state: { height: 1098787 } });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenCalledWith("https://gql.example.com/", {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        operationName: getOpName(query),
        query
      })
    });
  });

  it("Should fetch results with custom params", async () => {
    const boxId = "d8d1bf79e2b85e4ab6e23cdcdd08e5f364daa317cd6313b39ef0d4f9fdcadc6f";
    const mockedFetch = vi
      .spyOn(global, "fetch")
      .mockImplementation(fetch)
      .mockResolvedValueOnce(resolveString(`{"data":{"boxes":[{"boxId":"${boxId}"}]}}`));

    const mockedParser = {
      parse: vi.fn().mockImplementation(JSON.parse),
      stringify: vi.fn().mockImplementation(JSON.stringify)
    };

    const query = gql`
      query unspent($boxId: String) {
        boxes(boxId: $boxId) {
          boxId
        }
      }
    `;

    const getBoxes = createGqlOperation<{ boxes: Box[] }, QueryBoxesArgs>(query, {
      url: "https://gql.example.com/",
      parser: mockedParser,
      httpOptions: { headers: { foo: "bar" } }
    });

    const response = await getBoxes({ boxId });

    expect(response.data).to.be.deep.equal({ boxes: [{ boxId }] });
    expect(mockedParser.parse).toHaveBeenCalledOnce();
    expect(mockedParser.stringify).toHaveBeenCalledOnce();
    expect(mockedFetch).toHaveBeenCalledOnce();
    expect(mockedFetch).toHaveBeenCalledWith("https://gql.example.com/", {
      method: "POST",
      headers: { ...DEFAULT_HEADERS, foo: "bar" },
      body: JSON.stringify({
        operationName: getOpName(query),
        query,
        variables: { boxId }
      })
    });
  });

  it("Should throw if throwOnNonNetworkErrors is true and server returns errors", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      resolveString('{"errors":[{"message":"test error 1"},{"message":"test error 2"}]}')
    );

    const operation = createGqlOperation("query test { state { height } }", {
      url: "http://gql.example.com",
      throwOnNonNetworkErrors: true
    });

    expectTypeOf(operation).toMatchTypeOf<
      GraphQLOperation<GraphQLSuccessResponse, GraphQLVariables>
    >();

    await expect(operation).rejects.toThrowError(BlockchainProviderError);
  });
});

describe("Operation name extraction", () => {
  it("Should get operation name for named operations", () => {
    expect(
      getOpName(
        "mutation validateTx($tx: SignedTransaction!) { checkTransaction(signedTransaction: $tx) }"
      )
    ).to.be.equal("validateTx");

    expect(getOpName("query boxes { boxes { boxId } }")).to.be.equal("boxes");
    expect(getOpName("query _boxes { boxes { boxId } }")).to.be.equal("_boxes");
    expect(getOpName("query boxes-test { boxes { boxId } }")).to.be.equal("boxes-test");
    expect(getOpName("query boxes1 { boxes { boxId } }")).to.be.equal("boxes1");
    expect(getOpName(" query boxes ($take: Int) { boxes { boxId } }")).to.be.equal("boxes");
    expect(
      getOpName(`
        query unspent($take: Int, $address: String) {
          boxes (take: $take, address: $address) {
            boxId
          }
        }`)
    ).to.be.equal("unspent");
  });

  it("Should return undefined for unnamed operations", () => {
    expect(
      getOpName(`
        query ($take: Int, $address: String) {
          boxes (take: $take, address: $address) {
            boxId
          }
        }`)
    ).to.be.undefined;

    expect(getOpName("query { boxes { boxId } }")).to.be.undefined;
    expect(getOpName("mutation { boxes { boxId } }")).to.be.undefined;
    expect(getOpName(" query ($take: Int) { boxes { boxId } }")).to.be.undefined;
  });
});
