import { MAX_TOKENS_PER_BOX } from "../models";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

describe("Transaction builder settings", () => {
  it("Should hold defaults on constructing", () => {
    const settings = new TransactionBuilderSettings();
    expect(settings.canBurnTokens).toBe(false);
    expect(settings.canBurnTokensFromPlugins).toBe(false);
    expect(settings.maxTokensPerChangeBox).toBe(MAX_TOKENS_PER_BOX);
  });

  it("Should reflect changes", () => {
    const settings = new TransactionBuilderSettings()
      .allowTokenBurning(true)
      .allowTokenBurningFromPlugins(true)
      .setMaxTokensPerChangeBox(50);

    expect(settings.canBurnTokens).toBe(true);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
    expect(settings.maxTokensPerChangeBox).toBe(50);

    settings.allowTokenBurning(false);

    expect(settings.canBurnTokens).toBe(false);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
  });

  it("Should allow token burning from plugins if it's globally allowed", () => {
    const settings = new TransactionBuilderSettings().allowTokenBurning(true);

    expect(settings.canBurnTokens).toBe(true);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
  });

  it("Should allow token burning only from plugins context", () => {
    const settings = new TransactionBuilderSettings().allowTokenBurningFromPlugins(true);

    expect(settings.canBurnTokens).toBe(false);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
  });
});
