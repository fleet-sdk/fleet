import { MAX_DISTINCT_TOKENS_PER_BOX } from "./outputBuilder";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

describe("Transaction builder settings", () => {
  it("Should hold defaults on constructing", () => {
    const settings = new TransactionBuilderSettings();
    expect(settings.canBurnTokens).toEqual(false);
    expect(settings.maxDistinctTokensPerChangeBox).toEqual(MAX_DISTINCT_TOKENS_PER_BOX);
  });

  it("Should reflect changes", () => {
    const settings = new TransactionBuilderSettings()
      .allowTokenBurn(true)
      .setMaxDistinctTokensPerChangeBox(50);

    expect(settings.canBurnTokens).toEqual(true);
    expect(settings.maxDistinctTokensPerChangeBox).toEqual(50);
  });
});
