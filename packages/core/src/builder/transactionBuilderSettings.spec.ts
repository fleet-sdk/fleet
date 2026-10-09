import { describe, expect, it } from "vitest";
import { MAX_TOKENS_PER_BOX } from "../models";
import { TransactionBuilderSettings } from "./transactionBuilderSettings";

describe("Transaction builder settings", () => {
  it("Should hold defaults on constructing", () => {
    const settings = new TransactionBuilderSettings();
    expect(settings.canBurnTokens).toBeFalsy();
    expect(settings.canBurnTokensFromPlugins).toBeFalsy();
    expect(settings.maxTokensPerChangeBox).toBe(MAX_TOKENS_PER_BOX);
    expect(settings.shouldIsolateErgOnChange).toBeFalsy();
  });

  it("Should reflect changes", () => {
    const settings = new TransactionBuilderSettings()
      .allowTokenBurning(true)
      .allowTokenBurningFromPlugins(true)
      .setMaxTokensPerChangeBox(50)
      .isolateErgOnChange(true);

    expect(settings.canBurnTokens).toBe(true);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
    expect(settings.maxTokensPerChangeBox).toBe(50);
    expect(settings.shouldIsolateErgOnChange).toBe(true);

    settings.allowTokenBurning(false);

    expect(settings.canBurnTokens).toBe(false);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
  });

  it("Should set true by default for boolean methods", () => {
    const setting = new TransactionBuilderSettings()
      .allowTokenBurning(false)
      .allowTokenBurningFromPlugins(false)
      .isolateErgOnChange(false);

    expect(setting.canBurnTokens).toBeFalsy();
    expect(setting.canBurnTokensFromPlugins).toBeFalsy();
    expect(setting.shouldIsolateErgOnChange).toBeFalsy();

    setting.allowTokenBurning().allowTokenBurningFromPlugins().isolateErgOnChange();
    expect(setting.canBurnTokens).toBeTruthy();
    expect(setting.canBurnTokensFromPlugins).toBeTruthy();
    expect(setting.shouldIsolateErgOnChange).toBeTruthy();
  });

  it("Should allow token burning from plugins if it's globally allowed", () => {
    const settings = new TransactionBuilderSettings().allowTokenBurning(true);

    expect(settings.canBurnTokens).toBe(true);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
  });

  it("Should reject invalid max tokens per change box values", () => {
    const settings = new TransactionBuilderSettings();

    for (const invalid of [0, -5, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => settings.setMaxTokensPerChangeBox(invalid)).toThrow(RangeError);
    }

    expect(() => settings.setMaxTokensPerChangeBox(MAX_TOKENS_PER_BOX + 1)).toThrow(RangeError);
    expect(settings.maxTokensPerChangeBox).toBe(MAX_TOKENS_PER_BOX);
  });

  it("Should accept boundary max tokens per change box values", () => {
    const settings = new TransactionBuilderSettings();

    expect(settings.setMaxTokensPerChangeBox(1).maxTokensPerChangeBox).toBe(1);
    expect(settings.setMaxTokensPerChangeBox(MAX_TOKENS_PER_BOX).maxTokensPerChangeBox).toBe(
      MAX_TOKENS_PER_BOX
    );
  });

  it("Should allow token burning only from plugins context", () => {
    const settings = new TransactionBuilderSettings().allowTokenBurningFromPlugins(true);

    expect(settings.canBurnTokens).toBe(false);
    expect(settings.canBurnTokensFromPlugins).toBe(true);
  });
});
