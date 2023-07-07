import { _0n, assert, ensureBigInt as big, isDefined } from "@fleet-sdk/common";
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
import { ActionType, AgeUSDBank, CoinType } from "./ageUsdBank";

export type AgeUSDActionBase = {
  amount: Amount;
  recipient?: ErgoAddress | string;
  fee?: Amount;
};

export type AgeUSDMintAction = AgeUSDActionBase & {
  mint: CoinType;
};

export type AgeUSDRedeemAction = AgeUSDActionBase & {
  redeem: CoinType;
};

export type AgeUSDExchangeAction = AgeUSDMintAction | AgeUSDRedeemAction;

function minting(params: unknown): params is AgeUSDMintAction {
  return isDefined((params as AgeUSDMintAction).mint);
}

function buildErrorMsgFor(action: ActionType, coin: CoinType, bank: AgeUSDBank): string {
  const amount = action === "minting" ? bank.getAvailable(coin) : bank.getRedeemable(coin);
  const verb = action === "minting" ? "mint" : "redeem";

  return `Unable to ${verb} more than ${amount} ${coin} coins.`;
}

export function AgeUSDExchangePlugin(bank: AgeUSDBank, action: AgeUSDMintAction): FleetPlugin;
export function AgeUSDExchangePlugin(bank: AgeUSDBank, action: AgeUSDRedeemAction): FleetPlugin;
export function AgeUSDExchangePlugin(bank: AgeUSDBank, action: AgeUSDExchangeAction): FleetPlugin {
  const amount = big(action.amount);
  let stableDelta = _0n;
  let reserveDelta = _0n;
  let nanoergsDelta = _0n;
  let circulationDelta = _0n;

  if (minting(action)) {
    assert(bank.canMint(amount, action.mint), () => buildErrorMsgFor("minting", action.mint, bank));

    circulationDelta = amount;
    nanoergsDelta += bank.getMintingCostFor(amount, action.mint, "base", action.fee);
    if (action.mint === "stable") {
      stableDelta -= amount;
    } else {
      reserveDelta -= amount;
    }
  } else {
    assert(bank.canRedeem(amount, action.redeem), () =>
      buildErrorMsgFor("redeeming", action.redeem, bank)
    );

    circulationDelta -= amount;
    nanoergsDelta -= bank.getRedeemingAmountFor(amount, action.redeem, "base");
    if (action.redeem === "stable") {
      stableDelta += amount;
    } else {
      reserveDelta += amount;
    }
  }

  return ({ addInputs, addDataInputs, addOutputs, setFee }) => {
    const box = bank.bankBox;
    const stable = box.assets[0];
    const reserve = box.assets[1];
    const nft = box.assets[2];

    addInputs(box);
    addDataInputs(bank.oracleBox, { index: 0 });
    addOutputs(
      new OutputBuilder(big(box.value) + nanoergsDelta, box.ergoTree)
        .addTokens({ tokenId: stable.tokenId, amount: big(stable.amount) + stableDelta })
        .addTokens({ tokenId: reserve.tokenId, amount: big(reserve.amount) + reserveDelta })
        .addTokens(nft)
        .setAdditionalRegisters({
          R4: SConstant(SLong(SParse<bigint>(box.additionalRegisters.R4) - stableDelta)),
          R5: SConstant(SLong(SParse<bigint>(box.additionalRegisters.R5) - reserveDelta))
        }),
      { index: 0 }
    );

    if (action.fee) {
      setFee(action.fee);
    }

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

    if (bank.implementorAddress) {
      const feeAmount = bank.getImplementorFee(
        nanoergsDelta > _0n ? nanoergsDelta : -nanoergsDelta
      );

      if (feeAmount > _0n) {
        addOutputs(new OutputBuilder(feeAmount, bank.implementorAddress), { index: 2 });
      }
    }
  };
}
