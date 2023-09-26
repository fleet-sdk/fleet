import { clearUndefined, ensureDefaults } from "@fleet-sdk/common";

const OP_NAME_REGEX = /(query|mutation)\s?([\w\-_]+)?/;
export const DEFAULT_HEADERS: Headers = {
  "content-type": "application/json; charset=utf-8",
  accept: "application/graphql-response+json, application/json"
};

type Variables = Record<string, unknown> | null;
type GraphQLOperation<R, V extends Variables> = (variables?: V) => Promise<GraphQLResponse<R>>;
type Credentials = RequestCredentials;
type Headers = HeadersInit;
type Fetcher = typeof fetch;

export interface GraphQLResponse<T> {
  data?: T;
}

export interface ResponseParser {
  parse(text: string): unknown;
  stringify(value: unknown): string;
}

export interface RequestParams {
  operationName?: string | null;
  query: string;
  variables?: Record<string, unknown> | null;
}

export interface RequestOptions {
  url: URL | string;
  headers?: Headers;
  parser?: ResponseParser;
  fetcher?: Fetcher;
  credentials?: Credentials;
}

export function createOperation<R, V extends Variables = Variables>(
  query: string,
  options?: RequestOptions
): GraphQLOperation<R, V> {
  const opt = ensureDefaults(options, {
    credentials: "same-origin",
    parser: JSON,
    fetcher: fetch
  });
  opt.headers = ensureDefaults(options?.headers, DEFAULT_HEADERS);

  return async (variables?: V): Promise<GraphQLResponse<R>> => {
    const response = await opt.fetcher(opt.url, {
      method: "POST",
      headers: opt.headers,
      credentials: opt.credentials,
      body: opt.parser.stringify({
        operationName: getOpName(query),
        query,
        variables: variables ? clearUndefined(variables) : undefined
      } as RequestParams)
    });
    const data = await response.text();

    return opt.parser.parse(data);
  };
}

export function gql(query: TemplateStringsArray): string {
  return query[0];
}

export function getOpName(query: string): string | undefined {
  return OP_NAME_REGEX.exec(query)?.at(2);
}

export function isRequestParam(obj: unknown): obj is RequestOptions {
  return typeof obj === "object" && (obj as RequestOptions).url !== undefined;
}
