import { _0n, assert, ensureBigInt } from "@fleet-sdk/common";
import {
  Amount,
  ErgoAddress,
  FleetPlugin,
  OutputBuilder,
  SAFE_MIN_BOX_VALUE,
  SConstant,
  SLong,
  SParse
} from "@fleet-sdk/core";
import { AgeUSDBank } from "./ageUsdBank";

export type CoinType = "stable" | "reserve";

export type AgeUSDActionBase = {
  amount: Amount;
  recipient: ErgoAddress | string;
  fee: Amount;
};

export type AgeUSDMintAction = AgeUSDActionBase & {
  mint: CoinType;
};

export type AgeUSDRedeemAction = AgeUSDActionBase & {
  redeem: CoinType;
};

export type AgeUSDExchangeAction = AgeUSDMintAction | AgeUSDRedeemAction;

function minting(params: AgeUSDExchangeAction): params is AgeUSDMintAction {
  return !!(params as AgeUSDMintAction).mint;
}

function redeeming(params: AgeUSDExchangeAction): params is AgeUSDRedeemAction {
  return !!(params as AgeUSDRedeemAction).redeem;
}

export function AgeUSDExchangePlugin(bank: AgeUSDBank, action: AgeUSDMintAction): FleetPlugin;
export function AgeUSDExchangePlugin(bank: AgeUSDBank, action: AgeUSDRedeemAction): FleetPlugin;
export function AgeUSDExchangePlugin(bank: AgeUSDBank, action: AgeUSDExchangeAction): FleetPlugin {
  const amount = ensureBigInt(action.amount);
  let stableDelta = _0n;
  let reserveDelta = _0n;
  let nanoergsDelta = _0n;
  let circulationDelta = _0n;

  if (minting(action)) {
    circulationDelta = amount;

    if (action.mint === "stable") {
      assert(bank.canMintStableCoin(amount), "Can't mint Stable Coin.");

      nanoergsDelta += bank.getStableCoinMintingBaseCost(amount);
      stableDelta -= amount;
    } else if (action.mint === "reserve") {
      assert(bank.canMintReserveCoinAmount(amount), "Can't mint Reserve Coin.");

      nanoergsDelta += bank.getReserveCoinMintingBaseCost(amount);
      reserveDelta -= amount;
    }
  } else if (redeeming(action)) {
    circulationDelta -= amount;

    if (action.redeem === "stable") {
      assert(bank.canRedeemStableCoinAmount(amount), "Can't redeem Stable Coin.");

      nanoergsDelta -= bank.getStableCoinRedeemingBaseAmount(amount);
      stableDelta += amount;
    } else if (action.redeem === "reserve") {
      assert(bank.canRedeemReserveCoinAmount(amount), "Can't redeem Reserve Coin.");

      nanoergsDelta -= bank.getReserveCoinRedeemingBaseAmount(amount);
      reserveDelta += amount;
    }
  }

  assert(nanoergsDelta !== _0n, "Invalid params.");

  return ({ addInputs, addDataInputs, addOutputs, setFee }) => {
    const big = ensureBigInt;
    const box = bank.bankBox;
    const stable = box.assets[0];
    const reserve = box.assets[1];
    const nft = box.assets[2];

    addInputs(box);
    addDataInputs(bank.oracleBox, { index: 0 });
    setFee(action.fee);
    addOutputs(
      [
        new OutputBuilder(big(box.value) + nanoergsDelta, box.ergoTree)
          .addTokens({ tokenId: stable.tokenId, amount: big(stable.amount) + stableDelta })
          .addTokens({ tokenId: reserve.tokenId, amount: big(reserve.amount) + reserveDelta })
          .addTokens(nft)
          .setAdditionalRegisters({
            R4: SConstant(SLong(SParse<bigint>(box.additionalRegisters.R4) - stableDelta)),
            R5: SConstant(SLong(SParse<bigint>(box.additionalRegisters.R5) - reserveDelta))
          })
      ],
      { index: 0 }
    );

    if (action.recipient) {
      const recipient = new OutputBuilder(
        nanoergsDelta > _0n ? SAFE_MIN_BOX_VALUE : -nanoergsDelta,
        action.recipient
      ).setAdditionalRegisters({
        R4: SConstant(SLong(circulationDelta)),
        R5: SConstant(SLong(nanoergsDelta))
      });

      if (stableDelta < _0n) {
        recipient.addTokens({ tokenId: box.assets[0].tokenId, amount: -stableDelta });
      }

      if (reserveDelta < _0n) {
        recipient.addTokens({ tokenId: box.assets[1].tokenId, amount: -reserveDelta });
      }

      addOutputs(recipient, { index: 1 });
    }

    if (bank.uiFeeAddress) {
      const uiFeeAmount = bank.getUIFee(nanoergsDelta > _0n ? nanoergsDelta : -nanoergsDelta);

      if (uiFeeAmount > _0n) {
        addOutputs(new OutputBuilder(uiFeeAmount, bank.uiFeeAddress), { index: 1 });
      }
    }
  };
}
