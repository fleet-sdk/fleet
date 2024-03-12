import { describe, expect, it } from "vitest";
import { mockResponse } from "./_tests";
import { DEFAULT_HEADERS, get, post, RequestOptions } from "./rest";

const fetchMock = () => Promise.resolve(mockResponse('{"test": 0}'));

describe("rest - get", async () => {
  let nodeOptions: RequestOptions = {
    url: "https://sample.url.com",
    parser: JSON,
    fetcher: fetchMock,
    headers: DEFAULT_HEADERS
  };
  it("Should return object", async () => {
    const res = await get(nodeOptions);
    expect(res).toEqual({ test: 0 });
  });

  it("Should return object default options", async () => {
    global.fetch = fetchMock;
    nodeOptions = {
      url: "https://sample.url.com"
    };
    const res = await get(nodeOptions);
    expect(res).toEqual({ test: 0 });
  });
});

describe("rest - post", async () => {
  global.fetch = fetchMock;
  const nodeOptions: RequestOptions = {
    url: "https://sample.url.com"
  };

  it("Should return object", async () => {
    const res = await post({}, nodeOptions);
    expect(res).toEqual({ test: 0 });
  });
});
