import { BlockchainProviderError } from "@fleet-sdk/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveData } from "./_tests";
import { exponentialRetry, request } from "./networking";

describe("exponentialRetry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute operation successfully on first attempt", async () => {
    const operation = vi.fn().mockResolvedValue("result");
    const result = await exponentialRetry(operation, { attempts: 3, delay: 10 });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(result).toBe("result");
  });

  it("should retry operation and eventually succeed", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValue("result");

    const result = await exponentialRetry(operation, { attempts: 3, delay: 10 });

    expect(operation).toHaveBeenCalledTimes(3);
    expect(result).toBe("result");
  });

  it("should throw error if operation fails after all attempts", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("Failed"));

    await expect(exponentialRetry(operation, { attempts: 3, delay: 10 })).rejects.toThrowError(
      "Failed"
    );
    expect(operation).toHaveBeenCalledTimes(4); // 1 initial attempt + 3 retries
  });
});

describe("request", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a successful request and return the parsed response", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(resolveData(mockResponse));

    const parserMock = {
      parse: vi.fn().mockReturnValue(mockResponse),
      stringify: vi.fn().mockReturnValue(JSON.stringify(mockResponse))
    };

    const result = await request("/api/data", {
      parser: parserMock,
      base: "https://example.com",
      query: { param: "value" }
    });

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", undefined);
    expect(parserMock.parse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
    expect(result).toEqual(mockResponse);
  });

  it("should make a successful request and return the parsed response without setting base property", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(resolveData(mockResponse));

    const result = await request("https://example.com/api/data", {
      query: { param: "value" }
    });

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", undefined);
    expect(result).toEqual(mockResponse);
  });

  it("should make a successful request and return the parsed response without setting base and query property", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(resolveData(mockResponse));

    const result = await request("https://example.com/api/data");

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data", undefined);
    expect(result).toEqual(mockResponse);
  });

  it("should retry if the response status is in the retry status codes", async () => {
    const mockResponse = { data: "response" };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ...resolveData({}),
        status: 500,
        statusText: "Internal Server Error"
      } as unknown as Response)
      .mockResolvedValueOnce(resolveData(mockResponse));

    const parserMock = {
      parse: vi.fn().mockReturnValue(mockResponse),
      stringify: vi.fn().mockReturnValue(JSON.stringify(mockResponse))
    };

    const result = await request("/api/data", {
      parser: parserMock,
      base: "https://example.com",
      query: { param: "value" },
      retry: { attempts: 3, delay: 10 },
      httpOptions: { method: "GET" }
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", {
      method: "GET"
    });
    expect(parserMock.parse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
    expect(result).toEqual(mockResponse);
  });

  it("should retry the request and return the parsed response on success", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValueOnce(resolveData(mockResponse));

    const parserMock = {
      parse: vi.fn().mockReturnValue(mockResponse),
      stringify: vi.fn().mockReturnValue(JSON.stringify(mockResponse))
    };

    const result = await request("/api/data", {
      parser: parserMock,
      base: "https://example.com",
      query: { param: "value" },
      retry: { attempts: 3, delay: 10 },
      httpOptions: { method: "GET" }
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", {
      method: "GET"
    });
    expect(parserMock.parse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error if all retry attempts fail", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockRejectedValue(new Error("Failed"));
    const parserMock = {
      parse: vi.fn(),
      stringify: vi.fn()
    };

    await expect(
      request("/api/data", {
        parser: parserMock,
        base: "https://example.com",
        query: { param: "value" },
        retry: { attempts: 3, delay: 10 },
        httpOptions: { method: "GET" }
      })
    ).rejects.toThrowError("Failed");

    expect(fetchMock).toHaveBeenCalledTimes(4); // 1 initial attempt + 3 retries
    expect(parserMock.parse).not.toHaveBeenCalled();
  });

  it("Should retry the request using fallbacks and return the parsed response on success", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValueOnce(resolveData(mockResponse));

    const fallbacks = [
      { base: "https://fallback1.com", path: "/api/data", query: { param: "value1" } },
      "https://fallback2.com/api/data?param=value2",
      { base: "https://fallback3.com", path: "/api/data", query: { param: "value3" } }
    ];

    const result = await request("/api/data", {
      base: "https://example.com",
      query: { param: "value" },
      retry: { attempts: 3, delay: 10, fallbacks }
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", undefined); // initial attempt

    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback1.com/api/data?param=value1",
      undefined
    ); // first fallback
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback2.com/api/data?param=value2",
      undefined
    ); // second fallback

    expect(fetchMock).not.toHaveBeenCalledWith(
      "https://fallback3.com/api/data?param=value3",
      undefined
    ); // second fallback

    expect(result).toEqual(mockResponse);
  });

  it("Should retry the request using fallbacks and return fail if no response", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"))
      .mockRejectedValueOnce(new Error("Failed"));

    const fallbacks = [
      { base: "https://fallback1.com", path: "/api/data", query: { param: "value1" } },
      "https://fallback2.com/api/data?param=value2",
      { base: "https://fallback3.com", path: "/api/data", query: { param: "value3" } }
    ];

    await expect(
      request("/api/data", {
        base: "https://example.com",
        query: { param: "value" },
        retry: { attempts: 5, delay: 1, fallbacks }
      })
    ).rejects.toThrowError("Failed");

    expect(fetchMock).toHaveBeenCalledTimes(6); // 1 initial attempt + 5 retries
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", undefined); // initial attempt

    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback1.com/api/data?param=value1",
      undefined
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback2.com/api/data?param=value2",
      undefined
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback3.com/api/data?param=value3",
      undefined
    );
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data?param=value", undefined);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback1.com/api/data?param=value1",
      undefined
    );
  });

  it("should throw on non-2xx HTTP status responses", async () => {
    const parserMock = {
      parse: vi.fn(),
      stringify: vi.fn()
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve('{"message":"not found"}')
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "",
        text: () => Promise.resolve("{}")
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 199,
        statusText: "",
        text: () => Promise.resolve("{}")
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("{}")
      } as unknown as Response);

    const err404 = await request("https://example.com/api", { parser: parserMock }).catch(
      (e: unknown) => e
    );
    expect(err404).to.be.instanceOf(BlockchainProviderError);
    expect((err404 as BlockchainProviderError).message).to.be.equal("HTTP error 404 Not Found");

    await expect(request("https://example.com/api", { parser: parserMock })).rejects.toThrowError(
      "HTTP error 500"
    );
    await expect(request("https://example.com/api", { parser: parserMock })).rejects.toThrowError(
      "HTTP error 199"
    );
    await expect(request("https://example.com/api", { parser: parserMock })).rejects.toThrowError(
      "HTTP error"
    );

    expect(parserMock.parse).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("should skip retries for non-retryable status and throw after retry exhaustion", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve("{}")
      } as unknown as Response)
      .mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "",
        text: () => Promise.resolve("{}")
      } as unknown as Response);

    await expect(
      request("/api/data", {
        base: "https://example.com",
        retry: { attempts: 2, delay: 5 }
      })
    ).rejects.toThrowError("HTTP error 404 Not Found");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await expect(
      request("/api/data", {
        base: "https://example.com",
        retry: { attempts: 1, delay: 5 }
      })
    ).rejects.toThrowError("HTTP error 503");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("should accept minimal response objects without status or ok fields", async () => {
    const mockResponse = { ok: 1 };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      text: () => Promise.resolve(JSON.stringify(mockResponse))
    } as unknown as Response);

    const result = await request("https://example.com/api/data");
    expect(result).toEqual(mockResponse);
  });

  it("should build URLs with base only, empty query, and undefined query values", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(resolveData({ ok: true }));

    await request("/api/data", { base: "https://example.com" });
    expect(fetchMock).toHaveBeenLastCalledWith("https://example.com/api/data", undefined);

    await request("https://example.com/api/data", { query: {} });
    expect(fetchMock).toHaveBeenLastCalledWith("https://example.com/api/data", undefined);

    await request("/api/data", {
      base: "https://example.com",
      query: { param: "value", omitted: undefined }
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.com/api/data?param=value",
      undefined
    );
  });
});
