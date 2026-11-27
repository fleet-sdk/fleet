export const resolveString = (data: string) =>
  ({
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => new Promise((resolve) => resolve(data))
  }) as unknown as Response;

export const resolveData = (data: unknown) => resolveString(JSON.stringify(data));
