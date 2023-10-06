import { Box, QueryBoxesArgs, State } from "@ergo-graphql/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOperation, DEFAULT_HEADERS, getOpName, gql, isRequestParam } from "./graphql";
import { mockResponse } from "./testUtils";

describe("GraphQL query builder", () => {
  const fetchSpy = vi
    .spyOn(global, "fetch")
    .mockResolvedValueOnce(mockResponse('{"data":{"state":{"height":1098787}}}'));

  const parseSpy = vi.spyOn(JSON, "parse");
  const stringifySpy = vi.spyOn(JSON, "stringify");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Should fetch results with default params", async () => {
    const query = gql`
      query test {
        state {
          height
        }
      }
    `;
    const getBoxes = createOperation<{ state: State }>(query, {
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
      credentials: "same-origin",
      body: JSON.stringify({
        operationName: getOpName(query),
        query
      })
    });
  });

  it("Should fetch results with custom params", async () => {
    const boxId = "d8d1bf79e2b85e4ab6e23cdcdd08e5f364daa317cd6313b39ef0d4f9fdcadc6f";
    const mockedFetch = vi
      .fn()
      .mockImplementation(fetch)
      .mockResolvedValueOnce(mockResponse(`{"data":{"boxes":[{"boxId":"${boxId}"}]}}`));

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

    const getBoxes = createOperation<{ boxes: Box[] }, QueryBoxesArgs>(query, {
      url: "https://gql.example.com/",
      fetcher: mockedFetch,
      parser: mockedParser,
      headers: { foo: "bar" }
    });

    const response = await getBoxes({ boxId });

    expect(response.data).to.be.deep.equal({ boxes: [{ boxId }] });
    expect(mockedParser.parse).toHaveBeenCalledOnce();
    expect(mockedParser.stringify).toHaveBeenCalledOnce();
    expect(mockedFetch).toHaveBeenCalledOnce();
    expect(mockedFetch).toHaveBeenCalledWith("https://gql.example.com/", {
      method: "POST",
      headers: { ...DEFAULT_HEADERS, foo: "bar" },
      credentials: "same-origin",
      body: JSON.stringify({
        operationName: getOpName(query),
        query,
        variables: { boxId }
      })
    });
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

describe("Request param handler", () => {
  it("should return true for valid request params", () => {
    expect(isRequestParam({ url: "https://gql.example.com/" })).to.be.true;
  });

  it("should return false for invalid request params", () => {
    expect(isRequestParam({})).to.be.false;
    expect(isRequestParam(3)).to.be.false;
  });
});
