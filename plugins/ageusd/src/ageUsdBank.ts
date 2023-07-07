import {
  _0n,
  _1n,
  Amount,
  assert,
  ensureBigInt as big,
  Box,
  isDefined,
  max,
  min,
  percent,
  TokenAmount
} from "@fleet-sdk/common";
import { OnlyR4Register, R4ToR5Registers, SParse } from "@fleet-sdk/core";
import { AgeUSDBankParameters } from "./sigmaUsdParameters";

const _2n = BigInt(2);
const _3n = BigInt(3);
const _100n = BigInt(100);
const _1000000000n = BigInt(1000000000);

export type AgeUSDBankBox<T extends Amount = Amount> = Box<T, R4ToR5Registers>;
export type OracleBox = Box<Amount, OnlyR4Register>;
export type ImplementorFeeAmountCallback = (amount: bigint) => bigint;

export type CoinType = "stable" | "reserve";
export type ReturnType = "base" | "total";
export type FeeType = "protocol" | "implementor" | "all";
export type ActionType = "minting" | "redeeming";

export type ImplementorFeeCallbackOptions = {
  callback: ImplementorFeeAmountCallback;
  address: string;
};

export type ImplementorFeePercentageOptions = {
  percentage: bigint;
  precision?: bigint;
  address: string;
};

type ImplementorFeeOptions = ImplementorFeeCallbackOptions | ImplementorFeePercentageOptions;

function isImplementorFeeCallbackParams(params: unknown): params is ImplementorFeeCallbackOptions {
  return isDefined((params as ImplementorFeeCallbackOptions).callback);
}

export class AgeUSDBank {
  private readonly _bankBox: AgeUSDBankBox;
  private readonly _oracleBox: OracleBox;
  private readonly _oracleRate: bigint;
  private readonly _params: AgeUSDBankParameters;

  private _implementorFeeOptions?: ImplementorFeeCallbackOptions;

  constructor(bankBox: AgeUSDBankBox, oracleBox: OracleBox, params: AgeUSDBankParameters) {
    assert(this.validateBankBox(bankBox, params), "Invalid bank box.");
    assert(this.validateOracleBox(oracleBox, params), "Invalid oracle box.");

    this._bankBox = bankBox;
    this._oracleBox = oracleBox;
    this._params = params;

    const datapoint = oracleBox.additionalRegisters.R4;
    const decimals = params.oracle.decimals ?? 0;
    this._oracleRate = SParse<bigint>(datapoint) / BigInt(10 ** decimals);
  }

  get oracleBox(): OracleBox {
    return this._oracleBox;
  }

  get oracleRate(): bigint {
    return this._oracleRate;
  }

  get bankBox() {
    return this._bankBox;
  }

  get stableCoin(): TokenAmount<Amount> {
    return this._bankBox.assets[0];
  }

  get reserveCoin(): TokenAmount<Amount> {
    return this._bankBox.assets[1];
  }

  get nft(): TokenAmount<Amount> {
    return this._bankBox.assets[2];
  }

  get params(): AgeUSDBankParameters {
    return this._params;
  }

  get reserveRatio(): bigint {
    return this.getReserveRatio(this.baseReserves, this.circulatingStableCoins);
  }

  get baseReserves(): bigint {
    const value = big(this._bankBox.value);

    return value < this._params.minBoxValue ? _0n : value;
  }

  get liabilities(): bigint {
    if (this.circulatingStableCoins === _0n) return _0n;
    const neededReserves = this.circulatingStableCoins * this._oracleRate;

    return max(min(this.baseReserves, neededReserves), _0n);
  }

  get equity() {
    return max(this.baseReserves - this.liabilities, _0n);
  }

  get circulatingStableCoins(): bigint {
    return SParse(this._bankBox.additionalRegisters.R4);
  }

  get circulatingReserveCoins(): bigint {
    return SParse(this._bankBox.additionalRegisters.R5);
  }

  get stableCoinPrice(): bigint {
    const liabilities = this.liabilities;
    const circulating = this.circulatingStableCoins;

    return circulating === _0n || this._oracleRate < liabilities / circulating
      ? this._oracleRate
      : liabilities / circulating;
  }

  get reserveCoinPrice(): bigint {
    const circulating = this.circulatingReserveCoins;
    const equity = this.equity;

    if (circulating <= _1n || equity === _0n) {
      return this._params.defaultReserveCoinPrice;
    }

    return equity / circulating;
  }

  get availableStableCoins(): bigint {
    const minRatio = this._params.minReserveRatio;
    const circulating = this.circulatingStableCoins;

    const base = this.baseReserves * _100n - minRatio * this._oracleRate * circulating;
    const rate = this._oracleRate * (minRatio - _100n - 2n);

    return max(base / rate, _0n);
  }

  get availableReserveCoins(): bigint {
    return this._findLimitFor("reserve", "minting");
  }

  get redeemableReserveCoins(): bigint {
    return this._findLimitFor("reserve", "redeeming");
  }

  get redeemableStableCoins(): bigint {
    return this.circulatingStableCoins;
  }

  get implementorAddress(): string | undefined {
    return this._implementorFeeOptions?.address;
  }

  get stableCoinErgRate(): bigint {
    return _1000000000n / this.stableCoinPrice;
  }

  get reserveCoinErgRate(): bigint {
    return _1000000000n / this.reserveCoinPrice;
  }

  protected validateBankBox(bankBox: AgeUSDBankBox, params: AgeUSDBankParameters): boolean {
    return (
      bankBox.assets.length === 3 &&
      params.contract === bankBox.ergoTree &&
      bankBox.assets[0].tokenId === params.tokens.stableCoinId &&
      bankBox.assets[1].tokenId === params.tokens.reserveCoinId &&
      bankBox.assets[2].tokenId === params.tokens.nftId
    );
  }

  protected validateOracleBox(oracleBox: OracleBox, params: AgeUSDBankParameters): boolean {
    return (
      oracleBox.assets[0].tokenId === params.oracle.nftId &&
      isDefined(oracleBox.additionalRegisters.R4) &&
      typeof SParse(oracleBox.additionalRegisters.R4) === "bigint"
    );
  }

  setImplementorFee(options: ImplementorFeeCallbackOptions): AgeUSDBank;
  setImplementorFee(options: ImplementorFeePercentageOptions): AgeUSDBank;
  setImplementorFee(options: ImplementorFeeOptions): AgeUSDBank {
    if (isImplementorFeeCallbackParams(options)) {
      this._implementorFeeOptions = options;

      return this;
    }

    this._implementorFeeOptions = {
      address: options.address,
      callback:
        options.percentage > _0n
          ? (amount) => percent(amount, options.percentage, options.precision || _3n)
          : () => _0n
    };

    return this;
  }

  getImplementorFee(nanoergs: bigint): bigint {
    if (!this._implementorFeeOptions || !this._implementorFeeOptions.callback) return _0n;

    return this._implementorFeeOptions.callback(nanoergs);
  }

  getProtocolFee(nanoergs: bigint): bigint {
    return percent(nanoergs, _2n);
  }

  protected getReserveRatio(baseReserves: bigint, circulatingStableCoins: bigint): bigint {
    if (baseReserves === _0n || this._oracleRate === _0n) return _0n;

    let rate = baseReserves * _100n;
    if (circulatingStableCoins > _0n) {
      rate /= circulatingStableCoins;
    }

    return rate / this._oracleRate;
  }

  getAvailable(coin: CoinType): bigint {
    return coin === "stable" ? this.availableStableCoins : this.availableReserveCoins;
  }

  getRedeemable(coin: CoinType): bigint {
    return coin === "stable" ? this.redeemableStableCoins : this.redeemableReserveCoins;
  }

  canMint(amount: Amount, coin: CoinType): boolean {
    amount = big(amount);
    const newReserveRatio = this.getReserveRatioFor("minting", amount, coin);

    return coin === "stable"
      ? newReserveRatio >= this._params.minReserveRatio
      : newReserveRatio <= this._params.maxReserveRatio;
  }

  canRedeem(amount: Amount, coin: CoinType): boolean {
    amount = big(amount);

    return coin === "stable"
      ? amount <= this.circulatingStableCoins
      : this.getReserveRatioFor("redeeming", amount, "reserve") >= this._params.minReserveRatio;
  }

  getReserveRatioFor(action: ActionType, amount: Amount, coin: CoinType): bigint {
    amount = big(amount);
    let newReserve = _0n;
    let newCirculatingStable = this.circulatingStableCoins;

    if (action === "minting") {
      newReserve = this.baseReserves + this.getMintingCostFor(amount, coin);

      if (coin === "stable") {
        newCirculatingStable += amount;
      }
    } else {
      newReserve = max(this.baseReserves - this.getRedeemingAmountFor(amount, coin), _0n); // it's previously using minting

      if (coin === "stable") {
        newCirculatingStable -= amount;
      }
    }

    return this.getReserveRatio(newReserve, newCirculatingStable);
  }

  getFeeAmountFor(amount: Amount, coin: CoinType, type?: FeeType, txFee?: Amount): bigint {
    amount = big(amount);
    const price = coin === "stable" ? this.stableCoinPrice : this.reserveCoinPrice;
    const base = price * amount;
    let fee = this.getProtocolFee(base);

    if (type === "implementor") {
      fee = this.getImplementorFee(base + fee);
    } else if (type === "all") {
      txFee = isDefined(txFee) ? big(txFee) : _0n;
      fee += this.getImplementorFee(base + fee) + txFee;
    }

    return fee;
  }

  getMintingCostFor(amount: Amount, coin: CoinType, type?: ReturnType, txFee?: Amount): bigint {
    amount = big(amount);
    const price = coin === "stable" ? this.stableCoinPrice : this.reserveCoinPrice;
    const baseAmount = price * amount;
    let cost = baseAmount + this.getProtocolFee(baseAmount);

    if (type === "total") {
      txFee = isDefined(txFee) ? big(txFee) : _0n;
      cost += this.getImplementorFee(cost) + txFee;
    }

    return cost;
  }

  getRedeemingAmountFor(amount: Amount, coin: CoinType, type?: ReturnType, txFee?: Amount) {
    amount = big(amount);
    const price = coin === "stable" ? this.stableCoinPrice : this.reserveCoinPrice;
    const baseAmount = price * amount;
    let redeemAmount = baseAmount - this.getProtocolFee(baseAmount);

    if (type === "total") {
      txFee = isDefined(txFee) ? big(txFee) : _0n;
      const fees = txFee + this.getImplementorFee(redeemAmount);
      redeemAmount = max(redeemAmount - fees, _0n);
    }

    return redeemAmount;
  }

  private _findLimitFor(coin: CoinType, action: ActionType) {
    const minting = action === "minting";
    const target = minting ? this._params.maxReserveRatio : this._params.minReserveRatio;

    if (minting && !this.canMint(_1n, coin)) return _0n;
    if (!minting && this.getReserveRatioFor(action, _1n, coin) <= target) return _0n;

    let low = _0n;
    let mid = _0n;
    let high = minting ? big(this.reserveCoin.amount) : this.circulatingReserveCoins;
    let newRatio = _0n;

    while (low <= high && newRatio !== target) {
      mid = (high - low) / _2n + low;
      newRatio = this.getReserveRatioFor(action, mid, coin);

      if (newRatio === target) {
        low = mid;
      } else if ((minting && newRatio > target) || (!minting && newRatio < target)) {
        high = mid - _1n;
      } else {
        low = mid + _1n;
      }
    }

    return low;
  }
}
