export const mockResponse = (data: string) =>
  ({ text: () => new Promise((resolve) => resolve(data)) }) as unknown as Response;

export const mockResponseData = (data: unknown) => mockResponse(JSON.stringify(data));

export const mockChunkedResponse = (chunks: string[]) => {
  let i = 0;
  return {
    text: () => new Promise((resolve) => resolve(chunks[i++]))
  } as unknown as Response;
};
