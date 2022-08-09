import { TransactionBuilderSettings } from "./transactionBuilderSettings";

describe("Transaction builder settings", () => {
  it("Should hold defaults on constructing", () => {
    const settings = new TransactionBuilderSettings();
    expect(settings.canBurnTokens).toEqual(false);
    expect(settings.maxDistinctTokensPerChangeBox).toEqual(100);
  });

  it("Should reflect changes", () => {
    const settings = new TransactionBuilderSettings()
      .allowTokenBurn(true)
      .setMaxDistinctTokensPerChangeBox(50);

    expect(settings.canBurnTokens).toEqual(true);
    expect(settings.maxDistinctTokensPerChangeBox).toEqual(50);
  });
});
