import { MAX_TOKENS_PER_BOX } from "../models";

export class TransactionBuilderSettings {
  private _maxDistinctTokensPerChangeBox: number;
  private _allowTokenBurn: boolean;

  constructor() {
    this._maxDistinctTokensPerChangeBox = MAX_TOKENS_PER_BOX;
    this._allowTokenBurn = false;
  }

  public get maxTokensPerChangeBox(): number {
    return this._maxDistinctTokensPerChangeBox;
  }

  public get canBurnTokens(): boolean {
    return this._allowTokenBurn;
  }

  public setMaxTokensPerChangeBox(max: number): TransactionBuilderSettings {
    this._maxDistinctTokensPerChangeBox = max;

    return this;
  }

  public allowTokenBurn(allow: boolean): TransactionBuilderSettings {
    this._allowTokenBurn = allow;

    return this;
  }
}
