export const mockResponse = (data: string) => {
  return { text: () => new Promise((resolve) => resolve(data)) } as unknown as Response;
};

export const mockChunkedResponse = (chunks: string[]) => {
  let i = 0;
  return { text: () => new Promise((resolve) => resolve(chunks[i++])) } as unknown as Response;
};
