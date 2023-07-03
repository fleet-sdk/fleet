import {
  _0n,
  _1n,
  Amount,
  Box,
  ensureBigInt,
  hasKey,
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
export type UIFeeCallback = (amount: bigint) => bigint;

export type UIFeeCallbackParams = {
  callback: UIFeeCallback;
  address: string;
};

export type UIFeePercentageParams = {
  percentage: bigint;
  precision?: bigint;
  address: string;
};

type UIFeeParams = UIFeeCallbackParams | UIFeePercentageParams;

function isUIFeeCallbackParams(params: UIFeeParams): params is UIFeeCallbackParams {
  return hasKey(params, "callback");
}

export class AgeUSDBank {
  private readonly _bankBox: AgeUSDBankBox;
  private readonly _oracleBox: OracleBox;
  private readonly _oracleRate: bigint;
  private readonly _params: AgeUSDBankParameters;

  private _uiFeeParams?: UIFeeCallbackParams;

  constructor(bankBox: AgeUSDBankBox, oracleBox: OracleBox, params: AgeUSDBankParameters) {
    if (!this.validateBankBox(bankBox, params)) {
      throw new Error("Invalid bank box.");
    }

    if (!this.validateOracleBox(oracleBox, params)) {
      throw new Error("Invalid oracle box.");
    }

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
    return this.getReserveRatio(this.baseReserves, this.circulatingStableCoins, this._oracleRate);
  }

  get baseReserves(): bigint {
    const value = ensureBigInt(this._bankBox.value);

    return value < this._params.minBoxValue ? _0n : value;
  }

  get liabilities(): bigint {
    if (this.circulatingStableCoins === _0n) {
      return _0n;
    }

    const baseReservesNeeded = this.circulatingStableCoins * this._oracleRate;
    const baseReserve = this.baseReserves;

    return min(baseReserve, baseReservesNeeded);
  }

  get equity() {
    const baseReserves = this.baseReserves;
    const liabilities = this.liabilities;

    return liabilities < baseReserves ? baseReserves - liabilities : _0n;
  }

  get circulatingStableCoins(): bigint {
    return SParse(this._bankBox.additionalRegisters.R4);
  }

  get circulatingReserveCoins(): bigint {
    return SParse(this._bankBox.additionalRegisters.R5);
  }

  get stableCoinNominalPrice(): bigint {
    const oracleRate = this._oracleRate;
    const liabilities = this.liabilities;
    const numStableCoins = this.circulatingStableCoins;

    return numStableCoins === _0n || oracleRate < liabilities / numStableCoins
      ? oracleRate
      : liabilities / numStableCoins;
  }

  get reserveCoinNominalPrice(): bigint {
    const circulatingReserveCoins = this.circulatingReserveCoins;
    const equity = this.equity;

    if (circulatingReserveCoins <= _1n || equity === _0n) {
      return this._params.defaultReserveCoinPrice;
    }

    return equity / circulatingReserveCoins;
  }

  get stableCoinAvailableAmount(): bigint {
    const minReserveRatio = this._params.minReserveRatio;

    const base =
      this.baseReserves * _100n - minReserveRatio * this._oracleRate * this.circulatingStableCoins;
    const rate = this._oracleRate * (minReserveRatio - _100n - 2n);
    const available = base / rate;

    return max(available, _0n);
  }

  get reserveCoinAvailableAmount(): bigint {
    if (!this.canMintReserveCoinAmount(_1n)) {
      return _0n;
    }

    const maxReserveRatio = this._params.maxReserveRatio;
    let low = _0n;
    let mid = _0n;
    let high = ensureBigInt(this.reserveCoin.amount);
    let newReserveRatio = _0n;

    while (low <= high && newReserveRatio !== maxReserveRatio) {
      mid = (high - low) / _2n + low;
      newReserveRatio = this.getMintReserveCoinReserveRatioFor(mid);

      if (newReserveRatio === maxReserveRatio) {
        low = mid;
      } else if (newReserveRatio > maxReserveRatio) {
        high = mid - _1n;
      } else {
        low = mid + _1n;
      }
    }

    return low;
  }

  get reserveCoinRedeemableAmount(): bigint {
    const minReserveRatio = this._params.minReserveRatio;
    if (this.getRedeemReserveCoinReserveRatioFor(_1n) <= minReserveRatio) {
      return _0n;
    }

    let low = _0n;
    let mid = _0n;
    let high = this.circulatingReserveCoins;
    let newReserveRatio = _0n;

    while (low < high && newReserveRatio !== minReserveRatio) {
      mid = (high - low) / _2n + low;
      newReserveRatio = this.getRedeemReserveCoinReserveRatioFor(mid);

      if (newReserveRatio === minReserveRatio) {
        low = mid;
      } else if (newReserveRatio < minReserveRatio) {
        high = mid - _1n;
      } else {
        low = mid + _1n;
      }
    }

    return low;
  }

  get ergPriceInStableCoin(): bigint {
    return _1000000000n / this.stableCoinNominalPrice;
  }

  get ergPriceInReserveCoin(): bigint {
    return _1000000000n / this.reserveCoinNominalPrice;
  }

  get uiFeeAddress(): string | undefined {
    return this._uiFeeParams?.address;
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

  setUIFee(params: UIFeeCallbackParams): AgeUSDBank;
  setUIFee(params: UIFeePercentageParams): AgeUSDBank;
  setUIFee(params: UIFeeParams): AgeUSDBank {
    if (isUIFeeCallbackParams(params)) {
      this._uiFeeParams = params;

      return this;
    }

    this._uiFeeParams = {
      address: params.address,
      callback:
        params.percentage > _0n
          ? (amount) => percent(amount, params.percentage, params.precision || _3n)
          : () => _0n
    };

    return this;
  }

  getUIFee(amount: bigint): bigint {
    if (!this._uiFeeParams || !this._uiFeeParams.callback) {
      return _0n;
    }

    return this._uiFeeParams.callback(amount);
  }

  getProtocolFee(amount: bigint): bigint {
    return percent(amount, _2n);
  }

  protected getReserveRatio(
    baseReserves: bigint,
    circulatingStableCoins: bigint,
    oracleRate: bigint
  ): bigint {
    if (baseReserves === _0n || oracleRate === _0n) {
      return _0n;
    }

    if (circulatingStableCoins === _0n) {
      return (baseReserves * _100n) / oracleRate;
    }

    const perStableCoinRate = (baseReserves * _100n) / circulatingStableCoins;

    return perStableCoinRate / oracleRate;
  }

  canMintStableCoin(amount: bigint): boolean {
    const newReserve = this.getMintStableCoinReserveRatioFor(amount);

    return newReserve >= this._params.minReserveRatio;
  }

  getMintStableCoinReserveRatioFor(amount: bigint): bigint {
    const newBaseReserve = this.baseReserves + this.getStableCoinMintingBaseCost(amount);

    return this.getReserveRatio(
      newBaseReserve,
      this.circulatingStableCoins + amount,
      this._oracleRate
    );
  }

  canMintReserveCoinAmount(amount: bigint): boolean {
    const newReserveRatio = this.getMintReserveCoinReserveRatioFor(amount);

    return newReserveRatio <= this._params.maxReserveRatio;
  }

  getMintReserveCoinReserveRatioFor(amount: bigint) {
    const newBaseReserve = this.baseReserves + this.getReserveCoinMintingBaseCost(amount);

    return this.getReserveRatio(newBaseReserve, this.circulatingStableCoins, this._oracleRate);
  }

  canRedeemReserveCoinAmount(amount: bigint): boolean {
    return this.getRedeemReserveCoinReserveRatioFor(amount) >= this._params.minReserveRatio;
  }

  getRedeemReserveCoinReserveRatioFor(amount: bigint) {
    const redeemAmount = this.getReserveCoinMintingBaseCost(amount);
    const baseReserve = this.baseReserves;
    let newBaseReserve = _0n;

    if (redeemAmount < baseReserve) {
      newBaseReserve = baseReserve - redeemAmount;
    }

    return this.getReserveRatio(newBaseReserve, this.circulatingStableCoins, this._oracleRate);
  }

  canRedeemStableCoinAmount(amount: bigint): boolean {
    return amount <= this.circulatingStableCoins;
  }

  getTotalStableCoinMintingCost(amount: bigint, transactionFee: bigint): bigint {
    const baseCost = this.getStableCoinMintingBaseCost(amount);
    const minBoxValue = this._params.minBoxValue;

    return baseCost + transactionFee + minBoxValue * _2n + this.getUIFee(baseCost);
  }

  getStableCoinMintingFees(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);
    const uiFee = this.getUIFee(baseAmount + protocolFee);

    return transactionFee + protocolFee + uiFee;
  }

  getStableCoinMintingBaseCost(amount: bigint): bigint {
    const baseAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);

    return baseAmount + protocolFee;
  }

  getTotalReserveCoinMintingCost(amount: bigint, transactionFee: bigint): bigint {
    const baseCost = this.getReserveCoinMintingBaseCost(amount);
    const minBoxValue = this._params.minBoxValue;

    return baseCost + transactionFee + minBoxValue * _2n + this.getUIFee(baseCost);
  }

  getReserveCoinMintingFees(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);
    const uiFee = this.getUIFee(baseAmount + protocolFee);

    return transactionFee + protocolFee + uiFee;
  }

  getReserveCoinMintingBaseCost(amount: bigint): bigint {
    const baseAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);

    return baseAmount + protocolFee;
  }

  getTotalReserveCoinRedeemingAmount(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.getReserveCoinRedeemingBaseAmount(amount);
    const fees = transactionFee + this.getUIFee(baseAmount);

    return max(baseAmount - fees, _0n);
  }

  getReserveCoinRedeemingFees(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);
    const uiFee = this.getUIFee(this.getReserveCoinRedeemingBaseAmount(amount));

    return transactionFee + protocolFee + uiFee;
  }

  getReserveCoinRedeemingBaseAmount(amount: bigint): bigint {
    const baseAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);

    return baseAmount - protocolFee;
  }

  getTotalStableCoinRedeemingAmount(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.getStableCoinRedeemingBaseAmount(amount);
    const fees = transactionFee + this.getUIFee(baseAmount);

    return max(baseAmount - fees, _0n);
  }

  getRedeemingStableCoinFees(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);
    const uiFee = this.getUIFee(baseAmount + protocolFee);

    return protocolFee + transactionFee + uiFee;
  }

  getStableCoinRedeemingBaseAmount(amount: bigint): bigint {
    const baseAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(baseAmount);

    return baseAmount - protocolFee;
  }
}
