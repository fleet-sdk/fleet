import { BlockchainProviderError, clearUndefined, hasKey, some } from "@fleet-sdk/common";
import type { FallbackRetryOptions, ParserLike } from "./networking";
import { request } from "./networking";

const OP_NAME_REGEX =
  /^(?:\s|#[^\r\n]*)*(?:query|mutation|subscription)(?:\s|#[^\r\n]*)+([A-Za-z_][\w-]*)/;
const DEFAULT_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  accept: "application/graphql-response+json, application/json"
};

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

export type GraphQLResponse<T = unknown> = GraphQLSuccessResponse<T> | GraphQLErrorResponse;

export type GraphQLOperation<R extends GraphQLResponse, V extends GraphQLVariables> = (
  variables?: V,
  url?: string
) => Promise<R>;

export type GraphQLRequiredUrlOperation<R extends GraphQLResponse, V extends GraphQLVariables> = (
  variables: V | undefined,
  url: string
) => Promise<R>;

interface RequestParams {
  operationName?: string | null;
  query: string;
  variables?: Record<string, unknown> | null;
}

export interface GraphQLRequestOptions {
  url?: string;
  parser?: ParserLike;
  retry?: FallbackRetryOptions;
  throwOnNonNetworkErrors?: boolean;
  httpOptions?: Omit<RequestInit, "body" | "method">;
}

export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options: GraphQLRequestOptions & { throwOnNonNetworkErrors: true }
): GraphQLOperation<GraphQLSuccessResponse<R>, V>;
export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options?: GraphQLRequestOptions & { url: undefined }
): GraphQLRequiredUrlOperation<GraphQLResponse<R>, V>;
export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options: GraphQLRequestOptions & { url: undefined; throwOnNonNetworkErrors: true }
): GraphQLRequiredUrlOperation<GraphQLSuccessResponse<R>, V>;
export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options: GraphQLRequestOptions
): GraphQLOperation<GraphQLResponse<R>, V>;
export function createGqlOperation<R, V extends GraphQLVariables = GraphQLVariables>(
  query: string,
  options?: GraphQLRequestOptions
): GraphQLOperation<GraphQLResponse<R>, V> | GraphQLRequiredUrlOperation<GraphQLResponse<R>, V> {
  return async (variables?: V, url?: string): Promise<GraphQLResponse<R>> => {
    url = url ?? options?.url;
    if (!url) throw new Error("URL is required");

    const response = await request<GraphQLResponse<R>>(url, {
      ...options,
      httpOptions: {
        ...options?.httpOptions,
        method: "POST",
        headers: mergeHeaders(options?.httpOptions?.headers),
        body: (options?.parser ?? JSON).stringify({
          operationName: getOpName(query),
          query,
          variables: variables ? clearUndefined(variables) : undefined
        } as RequestParams)
      }
    });

    if (options?.throwOnNonNetworkErrors && some(response?.errors)) {
      const msg = response.errors[0].message;
      throw new BlockchainProviderError(msg, { cause: response.errors });
    }

    return response;
  };
}

export function gql(query: TemplateStringsArray): string {
  return query[0];
}

export function getOpName(query: string): string | undefined {
  return OP_NAME_REGEX.exec(query)?.at(1);
}

function toHeaderEntries(headers: HeadersInit): Iterable<string[]> {
  if (headers instanceof Headers) return headers as unknown as Iterable<string[]>;
  if (Array.isArray(headers)) return headers;
  return Object.entries(headers);
}

function mergeHeaders(headers?: HeadersInit): Record<string, string> {
  const result: Record<string, string> = { ...DEFAULT_HEADERS };
  if (!headers) return result;

  for (const [key, value] of toHeaderEntries(headers)) {
    const lower = key.toLowerCase();
    if (hasKey(DEFAULT_HEADERS, lower) && lower !== key) {
      delete result[lower];
    }

    result[key] = value;
  }

  return result;
}
