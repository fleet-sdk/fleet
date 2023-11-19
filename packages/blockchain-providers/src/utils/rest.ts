import { ensureDefaults } from "@fleet-sdk/common";

export type Fetcher = typeof fetch;

export const DEFAULT_HEADERS: Headers = new Headers({
  Accept: "application/json",
  "Content-Type": "application/json",
  mode: "cors",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT"
});

export interface ResponseParser {
  parse(text: string): unknown;
  stringify(value: unknown): string;
}

export interface RequestOptions {
  url: URL | string;
  headers?: Headers;
  parser?: ResponseParser;
  fetcher?: Fetcher;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function get(options: RequestOptions): Promise<any> {
  const opt = ensureDefaults(options, {
    parser: JSON,
    fetcher: fetch
  });
  opt.headers = ensureDefaults(options?.headers, DEFAULT_HEADERS);

  const response = await opt.fetcher(opt.url, {
    method: "GET",
    headers: opt.headers
  });
  const data = await response.text();

  return opt.parser.parse(data);
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function post(body: any, options: RequestOptions): Promise<any> {
  const opt = ensureDefaults(options, {
    parser: JSON,
    fetcher: fetch
  });
  opt.headers = ensureDefaults(options?.headers, DEFAULT_HEADERS);

  const response = await opt.fetcher(opt.url, {
    method: "POST",
    headers: opt.headers,
    body: opt.parser.stringify(body)
  });
  const data = await response.text();

  return opt.parser.parse(data);
}
