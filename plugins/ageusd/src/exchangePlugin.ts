import { _0n, assert, ensureBigInt as big, isDefined } from "@fleet-sdk/common";
import {
  Amount,
  ErgoAddress,
  FleetPlugin,
  OutputBuilder,
  SAFE_MIN_BOX_VALUE
} from "@fleet-sdk/core";
import { SConstant, SLong } from "@fleet-sdk/serializer";
import { ActionType, AgeUSDBank, CoinType } from "./ageUsdBank";

export type AgeUSDActionBase = {
  amount: Amount;
  recipient?: ErgoAddress | string;
  transactionFee?: Amount;
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

function buildErrorMsgFor(
  action: ActionType,
  coin: CoinType,
  bank: AgeUSDBank
): string {
  const amount =
    action === "minting" ? bank.getAvailable(coin) : bank.getRedeemable(coin);
  const verb = action === "minting" ? "mint" : "redeem";

  return `Unable to ${verb} more than ${amount} ${coin} coins.`;
}

export function AgeUSDExchangePlugin(
  bank: AgeUSDBank,
  action: AgeUSDMintAction
): FleetPlugin;
export function AgeUSDExchangePlugin(
  bank: AgeUSDBank,
  action: AgeUSDRedeemAction
): FleetPlugin;
export function AgeUSDExchangePlugin(
  bank: AgeUSDBank,
  action: AgeUSDExchangeAction
): FleetPlugin {
  const amount = big(action.amount);
  let stableDelta = _0n;
  let reserveDelta = _0n;
  let nanoergsDelta = _0n;
  let circulationDelta = _0n;

  let recipientAmount = _0n;
  let uiFeeAmount = _0n;

  if (minting(action)) {
    assert(bank.canMint(amount, action.mint), () =>
      buildErrorMsgFor("minting", action.mint, bank)
    );

    circulationDelta = amount;
    nanoergsDelta += bank.getMintingCostFor(amount, action.mint, "base");
    recipientAmount = SAFE_MIN_BOX_VALUE;
    uiFeeAmount = bank.getImplementorFee(nanoergsDelta);

    if (action.mint === "stable") {
      stableDelta -= amount;
    } else {
      reserveDelta -= amount;
    }
  } else {
    assert(bank.canRedeem(amount, action.redeem), () =>
      buildErrorMsgFor("redeeming", action.redeem, bank)
    );

    const txFee = isDefined(action.transactionFee)
      ? big(action.transactionFee)
      : _0n;
    const baseAmount = bank.getRedeemingAmountFor(
      amount,
      action.redeem,
      "base"
    );

    circulationDelta -= amount;
    nanoergsDelta -= baseAmount;
    recipientAmount = baseAmount;
    uiFeeAmount = bank.getFeeAmountFor(amount, action.redeem, "implementor");
    recipientAmount -= uiFeeAmount + txFee;

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
        .addTokens({
          tokenId: stable.tokenId,
          amount: big(stable.amount) + stableDelta
        })
        .addTokens({
          tokenId: reserve.tokenId,
          amount: big(reserve.amount) + reserveDelta
        })
        .addTokens(nft)
        .setAdditionalRegisters({
          R4: SLong(
            SConstant.from<bigint>(box.additionalRegisters.R4).data -
              stableDelta
          ).toHex(),
          R5: SLong(
            SConstant.from<bigint>(box.additionalRegisters.R5).data -
              reserveDelta
          ).toHex()
        }),
      { index: 0 }
    );

    if (action.transactionFee) {
      setFee(action.transactionFee);
    }

    if (action.recipient) {
      const recipient = new OutputBuilder(
        recipientAmount,
        action.recipient
      ).setAdditionalRegisters({
        R4: SLong(circulationDelta).toHex(),
        R5: SLong(nanoergsDelta).toHex()
      });

      if (stableDelta < _0n) {
        recipient.addTokens({
          tokenId: box.assets[0].tokenId,
          amount: -stableDelta
        });
      }

      if (reserveDelta < _0n) {
        recipient.addTokens({
          tokenId: box.assets[1].tokenId,
          amount: -reserveDelta
        });
      }

      addOutputs(recipient, { index: 1 });
    }

    if (bank.implementorAddress && uiFeeAmount > _0n) {
      addOutputs(new OutputBuilder(uiFeeAmount, bank.implementorAddress), {
        index: 2
      });
    }
  };
}
