export class TransactionBuilderSettings {
  private _maxDistinctTokensPerChangeBox;
  private _allowTokenBurn;

  constructor() {
    this._maxDistinctTokensPerChangeBox = 100;
    this._allowTokenBurn = false;
  }

  public get maxDistinctTokensPerChangeBox(): number {
    return this._maxDistinctTokensPerChangeBox;
  }

  public get canBurnTokens(): boolean {
    return this._allowTokenBurn;
  }

  public setMaxDistinctTokensPerChangeBox(max: number): TransactionBuilderSettings {
    this._maxDistinctTokensPerChangeBox = max;
    return this;
  }

  public allowTokenBurn(allow: boolean): TransactionBuilderSettings {
    this._allowTokenBurn = allow;
    return this;
  }
}
