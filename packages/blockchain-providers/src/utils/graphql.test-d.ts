import { describe, expectTypeOf, it } from "vitest";
import {
  type GraphQLOperation,
  type GraphQLResponse,
  type GraphQLSuccessResponse,
  type GraphQLVariables,
  createGqlOperation
} from "./graphql";

describe("createGqlOperation() types", () => {
  const query = "query test { state { height } }";
  const url = "https://gql.example.com/";

  it("Should infer the correct type when throwOnNonNetworkErrors is set to true", () => {
    const throwable = createGqlOperation(query, {
      throwOnNonNetworkErrors: true,
      url
    });
    expectTypeOf(throwable).toMatchTypeOf<
      GraphQLOperation<GraphQLSuccessResponse, GraphQLVariables>
    >();

    const notThrowable = createGqlOperation(query, {
      throwOnNonNetworkErrors: false,
      url
    });
    expectTypeOf(notThrowable).toMatchTypeOf<GraphQLOperation<GraphQLResponse, GraphQLVariables>>();
  });
});
