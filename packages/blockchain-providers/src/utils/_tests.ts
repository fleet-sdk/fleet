export const resolveString = (data: string) =>
  ({
    text: () => new Promise((resolve) => resolve(data))
  }) as unknown as Response;

export const resolveData = (data: unknown) => resolveString(JSON.stringify(data));
