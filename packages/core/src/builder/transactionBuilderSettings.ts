import { MAX_TOKENS_PER_BOX } from "../models";

export class TransactionBuilderSettings {
  private _maxDistinctTokensPerChangeBox: number;
  private _allowTokenBurn: boolean;
  private _allowTokenPluginFromPlugins: boolean;

  constructor() {
    this._maxDistinctTokensPerChangeBox = MAX_TOKENS_PER_BOX;
    this._allowTokenBurn = false;
    this._allowTokenPluginFromPlugins = false;
  }

  public get maxTokensPerChangeBox(): number {
    return this._maxDistinctTokensPerChangeBox;
  }

  public get canBurnTokens(): boolean {
    return this._allowTokenBurn;
  }

  public get canBurnTokensFromPlugins(): boolean {
    return this.canBurnTokens || this._allowTokenPluginFromPlugins;
  }

  /**
   * Define max number of distinct tokens per change box
   */
  public setMaxTokensPerChangeBox(max: number): TransactionBuilderSettings {
    this._maxDistinctTokensPerChangeBox = max;

    return this;
  }

  /**
   * Allows or denies token burning from all contexts
   */
  public allowTokenBurning(allow: boolean): TransactionBuilderSettings {
    this._allowTokenBurn = allow;

    return this;
  }

  /**
   * Allows or denies token burning **only** from plugins context.
   */
  public allowTokenBurningFromPlugins(allow: boolean): TransactionBuilderSettings {
    this._allowTokenPluginFromPlugins = allow;

    return this;
  }
}
