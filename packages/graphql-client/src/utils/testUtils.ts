export const mockResponse = (data: string) => {
  return { text: () => new Promise((resolve) => resolve(data)) } as unknown as Response;
};
