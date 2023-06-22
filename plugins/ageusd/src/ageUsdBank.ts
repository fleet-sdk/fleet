import { _0n, _1n, Amount, Box, ensureBigInt, isDefined, TokenAmount } from "@fleet-sdk/common";
import { OnlyR4Register, R4ToR5Registers, SParse } from "@fleet-sdk/core";
import { AgeUSDBankParameters } from "./sigmaUsdParameters";

const _2n = BigInt(2);
const _100n = BigInt(100);
const _1000n = BigInt(1000);
const _1000000000n = BigInt(1e9);

export type AgeUSDBankBox<T extends Amount = Amount> = Box<T, R4ToR5Registers>;
export type OracleBox = Box<Amount, OnlyR4Register>;

export class AgeUSDBank {
  private readonly _bankBox: AgeUSDBankBox;
  private readonly _oracleBox: OracleBox;
  private readonly _oracleRate: bigint;
  private readonly _params: AgeUSDBankParameters;

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
    this._oracleRate = SParse<bigint>(datapoint) / BigInt(10 ** params.oracle.datapointDecimals);
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

    return baseReservesNeeded < baseReserve ? baseReservesNeeded : baseReserve;
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

    return available >= _0n ? available : _0n;
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

  protected validateBankBox(bankBox: AgeUSDBankBox, params: AgeUSDBankParameters): boolean {
    return (
      bankBox.assets.length === 3 &&
      params.contract === bankBox.ergoTree &&
      bankBox.assets[0].tokenId === params.tokens.stableCoinTokenId &&
      bankBox.assets[1].tokenId === params.tokens.reserveCoinTokenId &&
      bankBox.assets[2].tokenId === params.tokens.nftTokenId
    );
  }

  protected validateOracleBox(oracleBox: OracleBox, params: AgeUSDBankParameters): boolean {
    return (
      oracleBox.assets[0].tokenId === params.oracle.nftTokenId &&
      isDefined(oracleBox.additionalRegisters.R4) &&
      typeof SParse(oracleBox.additionalRegisters.R4) === "bigint"
    );
  }

  protected getImplementorFee(amount: bigint): bigint {
    return (amount * _2n) / _1000n;
  }

  protected getProtocolFee(amount: bigint): bigint {
    return (amount * _2n) / _100n;
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

    return baseCost + transactionFee + minBoxValue * _2n + this.getImplementorFee(baseCost);
  }

  getStableCoinMintingFees(amount: bigint, transactionFee: bigint): bigint {
    const feeLessAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = feeLessAmount + this.getProtocolFee(feeLessAmount);
    const implementorFee = this.getImplementorFee(feeLessAmount + protocolFee);

    return transactionFee + protocolFee + implementorFee;
  }

  getStableCoinMintingBaseCost(amount: bigint): bigint {
    const feeLessAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);

    return feeLessAmount + protocolFee;
  }

  getTotalReserveCoinMintingCost(amount: bigint, transactionFee: bigint): bigint {
    const baseCost = this.getReserveCoinMintingBaseCost(amount);
    const minBoxValue = this._params.minBoxValue;

    return baseCost + transactionFee + minBoxValue * _2n + this.getImplementorFee(baseCost);
  }

  getReserveCoinMintingFees(amount: bigint, transactionFee: bigint): bigint {
    const feeLessAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);
    const implementorFee = this.getImplementorFee(this.getStableCoinMintingBaseCost(amount));

    return transactionFee + protocolFee + implementorFee;
  }

  getReserveCoinMintingBaseCost(amount: bigint): bigint {
    const feeLessAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);

    return feeLessAmount + protocolFee;
  }

  getTotalReserveCoinRedeemingAmount(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.getReserveCoinRedeemingBaseAmount(amount);
    const fees = transactionFee + this.getImplementorFee(baseAmount);

    return baseAmount < fees ? baseAmount - fees : _0n;
  }

  getReserveCoinRedeemingFees(amount: bigint, transactionFee: bigint): bigint {
    const feeLessAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);
    const implementorFee = this.getImplementorFee(this.getReserveCoinRedeemingBaseAmount(amount));

    return transactionFee + protocolFee + implementorFee;
  }

  getReserveCoinRedeemingBaseAmount(amount: bigint): bigint {
    const feeLessAmount = this.reserveCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);

    return feeLessAmount - protocolFee;
  }

  getTotalStableCoinRedeemingAmount(amount: bigint, transactionFee: bigint): bigint {
    const baseAmount = this.getStableCoinRedeemingBaseAmount(amount);
    const fees = transactionFee + this.getImplementorFee(baseAmount);

    return baseAmount < fees ? baseAmount - fees : _0n;
  }

  getRedeemingStableCoinFees(amount: bigint, transactionFee: bigint): bigint {
    const feeLessAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);
    const implementorFee = this.getImplementorFee(feeLessAmount + protocolFee);

    return protocolFee + transactionFee + implementorFee;
  }

  getStableCoinRedeemingBaseAmount(amount: bigint): bigint {
    const feeLessAmount = this.stableCoinNominalPrice * amount;
    const protocolFee = this.getProtocolFee(feeLessAmount);

    return feeLessAmount - protocolFee;
  }
}
