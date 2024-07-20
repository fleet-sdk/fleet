import {
  BlockchainProviderError,
  clearUndefined,
  ensureDefaults,
  isEmpty,
  some
} from "@fleet-sdk/common";

const OP_NAME_REGEX = /(query|mutation)\s?([\w\-_]+)?/;
export const DEFAULT_HEADERS: Headers = {
  "content-type": "application/json; charset=utf-8",
  accept: "application/graphql-response+json, application/json"
};

type Credentials = RequestCredentials;
type Headers = HeadersInit;
type Fetcher = typeof fetch;

export type GraphQLVariables = Record<string, unknown> | null;

export interface GraphQLError {
  message: string;
}

export interface GraphQLSuccessResponse<T = unknown> {
  data: T;
  errors: null;
}

export interface GraphQLErrorResponse {
  data: null;
  errors: GraphQLError[];
}

export type GraphQLResponse<T = unknown> =
  | GraphQLSuccessResponse<T>
  | GraphQLErrorResponse;

export type GraphQLOperation<R extends GraphQLResponse, V extends GraphQLVariables> = (
  variables?: V
) => Promise<R>;

export interface ResponseParser {
  parse<T>(text: string): T;
  stringify<T>(value: T): string;
}

export interface RequestParams {
  operationName?: string | null;
  query: string;
  variables?: Record<string, unknown> | null;
}

export interface GraphQLRequestOptions {
  url: URL | string;
  headers?: Headers;
  parser?: ResponseParser;
  fetcher?: Fetcher;
  credentials?: Credentials;
  throwOnNonNetworkErrors?: boolean;
}

export interface GraphQLThrowableOptions extends GraphQLRequestOptions {
  throwOnNonNetworkErrors: true;
}

export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options: GraphQLThrowableOptions
): GraphQLOperation<GraphQLSuccessResponse<R>, V>;
export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options: GraphQLRequestOptions
): GraphQLOperation<GraphQLResponse<R>, V>;
export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options: GraphQLRequestOptions
): GraphQLOperation<GraphQLResponse<R>, V> {
  return async (variables?: V): Promise<GraphQLResponse<R>> => {
    const response = await (options.fetcher ?? fetch)(options.url, {
      method: "POST",
      headers: ensureDefaults(options.headers, DEFAULT_HEADERS),
      credentials: options.credentials,
      body: (options.parser ?? JSON).stringify({
        operationName: getOpName(query),
        query,
        variables: variables ? clearUndefined(variables) : undefined
      } as RequestParams)
    });

    const rawData = await response.text();
    const parsedData = (options.parser ?? JSON).parse(rawData) as GraphQLResponse<R>;

    if (
      options.throwOnNonNetworkErrors &&
      some(parsedData.errors) &&
      isEmpty(parsedData.data)
    ) {
      throw new BlockchainProviderError(parsedData.errors[0].message, {
        cause: parsedData.errors
      });
    }

    return parsedData;
  };
}

export function gql(query: TemplateStringsArray): string {
  return query[0];
}

export function getOpName(query: string): string | undefined {
  return OP_NAME_REGEX.exec(query)?.at(2);
}

export function isRequestParam(obj: unknown): obj is GraphQLRequestOptions {
  return typeof obj === "object" && (obj as GraphQLRequestOptions).url !== undefined;
}
