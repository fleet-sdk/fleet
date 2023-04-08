import { MAX_TOKENS_PER_BOX } from "../models";

export class TransactionBuilderSettings {
  private _maxDistinctTokensPerChangeBox: number;
  private _allowTokenBurning: boolean;
  private _allowTokenBurningFromPlugins: boolean;

  constructor() {
    this._maxDistinctTokensPerChangeBox = MAX_TOKENS_PER_BOX;
    this._allowTokenBurning = false;
    this._allowTokenBurningFromPlugins = false;
  }

  public get maxTokensPerChangeBox(): number {
    return this._maxDistinctTokensPerChangeBox;
  }

  public get canBurnTokens(): boolean {
    return this._allowTokenBurning;
  }

  public get canBurnTokensFromPlugins(): boolean {
    return this.canBurnTokens || this._allowTokenBurningFromPlugins;
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
    this._allowTokenBurning = allow;

    return this;
  }

  /**
   * Allows or denies token burning **only** from plugins context.
   */
  public allowTokenBurningFromPlugins(allow: boolean): TransactionBuilderSettings {
    this._allowTokenBurningFromPlugins = allow;

    return this;
  }
}
