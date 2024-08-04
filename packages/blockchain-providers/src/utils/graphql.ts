import {
  BlockchainProviderError,
  clearUndefined,
  ensureDefaults,
  isEmpty,
  some
} from "@fleet-sdk/common";
import type { FallbackRetryOptions, ParserLike } from "./networking";
import { request } from "./networking";

const OP_NAME_REGEX = /(query|mutation)\s?([\w\-_]+)?/;
export const DEFAULT_HEADERS = {
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

export type GraphQLResponse<T = unknown> =
  | GraphQLSuccessResponse<T>
  | GraphQLErrorResponse;

export type GraphQLOperation<R extends GraphQLResponse, V extends GraphQLVariables> = (
  variables?: V
) => Promise<R>;

interface RequestParams {
  operationName?: string | null;
  query: string;
  variables?: Record<string, unknown> | null;
}

export interface GraphQLRequestOptions {
  url: string;
  parser?: ParserLike;
  retry?: FallbackRetryOptions;
  throwOnNonNetworkErrors?: boolean;
  httpOptions?: Omit<RequestInit, "body" | "method">;
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
    const response = await request<GraphQLResponse<R>>(options.url, {
      ...options,
      httpOptions: {
        ...options.httpOptions,
        method: "POST",
        headers: ensureDefaults(options.httpOptions?.headers, DEFAULT_HEADERS),
        body: (options.parser ?? JSON).stringify({
          operationName: getOpName(query),
          query,
          variables: variables ? clearUndefined(variables) : undefined
        } as RequestParams)
      }
    });

    if (
      options.throwOnNonNetworkErrors &&
      some(response.errors) &&
      isEmpty(response.data)
    ) {
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
  return OP_NAME_REGEX.exec(query)?.at(2);
}

export function isRequestParam(obj: unknown): obj is GraphQLRequestOptions {
  return typeof obj === "object" && (obj as GraphQLRequestOptions).url !== undefined;
}
