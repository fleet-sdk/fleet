import { some } from "@fleet-sdk/common";

export interface ParserLike {
  parse<T>(text: string): T;
  stringify<T>(value: T): string;
}

export type Route = { base: string; path: string; query?: Record<string, unknown> };
export type URLLike = string | Route;
export type FallbackRetryOptions = { fallbacks?: URLLike[] } & RetryOptions;

export type FetchOptions = {
  parser?: ParserLike;
  base?: string;
  query?: Record<string, unknown>;
  retry?: FallbackRetryOptions;
  httpOptions?: RequestInit;
};

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const RETRY_STATUS_CODES = new Set([
  408, // Request Timeout
  409, // Conflict
  425, // Too Early (Experimental)
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504 // Gateway Timeout
]);

export async function request<T>(path: string, opt?: Partial<FetchOptions>): Promise<T> {
  const url = buildURL(path, opt?.query, opt?.base);

  let response: Response;
  if (opt?.retry) {
    const routes = some(opt.retry.fallbacks) ? [url, ...opt.retry.fallbacks] : [url];
    const attempts = opt.retry.attempts;
    response = await exponentialRetry(async (r) => {
      const response = await fetch(resolveUrl(routes, attempts - r), opt.httpOptions);
      if (RETRY_STATUS_CODES.has(response.status)) throw new Error(response.statusText);

      return response;
    }, opt.retry);
  } else {
    response = await fetch(url, opt?.httpOptions);
  }

  return (opt?.parser || JSON).parse(await response.text());
}

function resolveUrl(routes: URLLike[], attempt: number) {
  const route = routes[attempt % routes.length];
  return typeof route === "string"
    ? route
    : buildURL(route.path, route.query, route.base).toString();
}

function buildURL(path: string, query?: Record<string, unknown>, base?: string) {
  if (!base && !query) return path;

  const url = new URL(path, base);
  if (some(query)) {
    for (const key in query) url.searchParams.append(key, String(query[key]));
  }

  return url.toString();
}

export type RetryOptions = {
  attempts: number;
  delay: number;
};

/**
 * Retries an asynchronous operation a specified number of times with a delay
 * growing exponentially between each attempt.
 * @param operation - The asynchronous operation to retry.
 * @param options - The retry options.
 * @returns A promise that resolves to the result of the operation, or undefined
 * if all attempts fail.
 */
export async function exponentialRetry<T>(
  operation: (remainingAttempts: number) => Promise<T>,
  { attempts, delay }: RetryOptions
): Promise<T> {
  try {
    return await operation(attempts);
  } catch (e) {
    if (attempts > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return exponentialRetry(operation, { attempts: attempts - 1, delay: delay * 2 });
    }

    throw e;
  }
}
