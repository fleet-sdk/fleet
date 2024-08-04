import { afterEach, describe, expect, it, vi } from "vitest";
import { exponentialRetry, request } from "./networking";
import { mockResponseData } from "./_tests";

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

    await expect(
      exponentialRetry(operation, { attempts: 3, delay: 10 })
    ).rejects.toThrowError("Failed");
    expect(operation).toHaveBeenCalledTimes(4); // 1 initial attempt + 3 retries
  });
});

describe("request", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a successful request and return the parsed response", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponseData(mockResponse));

    const parserMock = {
      parse: vi.fn().mockReturnValue(mockResponse),
      stringify: vi.fn().mockReturnValue(JSON.stringify(mockResponse))
    };

    const result = await request("/api/data", {
      parser: parserMock,
      base: "https://example.com",
      query: { param: "value" }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/data?param=value",
      undefined
    );
    expect(parserMock.parse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
    expect(result).toEqual(mockResponse);
  });

  it("should make a successful request and return the parsed response without setting base property", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponseData(mockResponse));

    const result = await request("https://example.com/api/data", {
      query: { param: "value" }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/data?param=value",
      undefined
    );
    expect(result).toEqual(mockResponse);
  });

  it("should make a successful request and return the parsed response without setting base and query property", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponseData(mockResponse));

    const result = await request("https://example.com/api/data");

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/data", undefined);
    expect(result).toEqual(mockResponse);
  });

  it("should retry the request and return the parsed response on success", async () => {
    const mockResponse = { data: "response" };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValueOnce(mockResponseData(mockResponse));

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
      .mockResolvedValueOnce(mockResponseData(mockResponse));

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
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/data?param=value",
      undefined
    ); // initial attempt

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
    const mockResponse = { data: "response" };
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
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/data?param=value",
      undefined
    ); // initial attempt

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
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/data?param=value",
      undefined
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fallback1.com/api/data?param=value1",
      undefined
    );
  });
});
