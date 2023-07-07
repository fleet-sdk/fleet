import { RECOMMENDED_MIN_FEE_VALUE, SParse, TransactionBuilder } from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { afterEach, describe, expect, it } from "vitest";
import { mockBankBox, mockOracleBox } from "./_tests/mocking";
import { AgeUSDBankBox } from "./ageUsdBank";
import { AgeUSDExchangePlugin } from "./exchangePlugin";
import { SigmaUSDBank } from "./sigmaUsdBank";
import { SIGMA_USD_PARAMETERS } from "./sigmaUsdParameters";

describe("AgeUSD exchange plugin", () => {
  const height = 1036535;

  const chain = new MockChain(height);
  const tokens = SIGMA_USD_PARAMETERS.tokens;
  chain.assetsMetadata.set("nanoerg", { name: "ERG", decimals: 9 });
  chain.assetsMetadata.set(tokens.stableCoinId, { name: "SigUSD", decimals: 2 });
  chain.assetsMetadata.set(tokens.reserveCoinId, { name: "SigRSV" });
  chain.assetsMetadata.set(tokens.nftId, { name: "SUSD Bank V2 NFT" });
  const bob = chain.newParty("Bob");
  const bankParty = chain.newParty({
    name: "SigmaUSD Bank",
    ergoTree: SIGMA_USD_PARAMETERS.contract
  });

  afterEach(() => {
    bob.utxos.clear();
    bankParty.utxos.clear();
  });

  it("Should mint reserve coin with reserve at 348%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_482_462_367921576n,
        circulatingStableCoin: SParse("0584cda232"),
        circulatingReserveCoin: SParse("05acdac7e612")
      }),
      mockOracleBox(SParse("05b8e68b8106"))
    ).setImplementorFee({
      percentage: 11n,
      precision: 4n,
      address: "9fB6AxKB8fLaSZzCRrcVmojkYnS3noq7kxcgd3oRqdTpL3FrmpD"
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 40_000000000n });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const reserveRatio = 348n;
    const mintingAmount = 83760n;
    const baseCost = 35_798459457n;
    const uiFee = 39378305n;
    const totalCost = baseCost + uiFee;

    expect(bank.reserveRatio).to.be.equal(reserveRatio);
    expect(bank.getFeeAmountFor(mintingAmount, "reserve", "protocol")).to.be.equal(701930577n);
    expect(bank.getFeeAmountFor(mintingAmount, "reserve", "implementor")).to.be.equal(uiFee);
    expect(bank.getMintingCostFor(mintingAmount, "reserve", "base")).to.be.equal(baseCost);
    expect(bank.getMintingCostFor(mintingAmount, "reserve", "total")).to.be.equal(totalCost);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          mint: "reserve",
          amount: mintingAmount,
          recipient: bob.address
        })
      )
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5); // "bob_change + bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs + baseCost,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount - mintingAmount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs - totalCost - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [{ tokenId: tokens.reserveCoinId, amount: mintingAmount }]
    });
  });

  it("Should mint all available reserve coins with reserve at 348%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_482_462_367921576n,
        circulatingStableCoin: SParse("0584cda232"),
        circulatingReserveCoin: SParse("05acdac7e612")
      }),
      mockOracleBox(SParse("05b8e68b8106"))
    ).setImplementorFee({
      percentage: 11n,
      precision: 4n,
      address: "9fB6AxKB8fLaSZzCRrcVmojkYnS3noq7kxcgd3oRqdTpL3FrmpD"
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 1_921_394_389201462n });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const reserveRatio = 348n;
    const mintingAmount = bank.availableReserveCoins;
    const baseCost = 1_919_283_175608293n;
    const uiFee = 2_111_211493169n;
    const totalCost = baseCost + uiFee;

    expect(bank.reserveRatio).to.be.equal(reserveRatio);
    expect(bank.getFeeAmountFor(mintingAmount, "reserve", "implementor")).to.be.equal(uiFee);
    expect(bank.getMintingCostFor(mintingAmount, "reserve", "base")).to.be.equal(baseCost);
    expect(bank.getMintingCostFor(mintingAmount, "reserve", "total")).to.be.equal(totalCost);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          mint: "reserve",
          amount: mintingAmount,
          recipient: bob.address,
          fee: RECOMMENDED_MIN_FEE_VALUE
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(4); // "bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs + baseCost,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount - mintingAmount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    bank.bankBox = bankParty.utxos.at(0) as AgeUSDBankBox;
    expect(bank.reserveRatio).to.be.equal(800n);

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs - totalCost - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [{ tokenId: tokens.reserveCoinId, amount: mintingAmount }]
    });
  });

  it("Should not mint stable coin with reserve at 348%", () => {
    const originalBobBalance = 40_000000000n;
    const originalBankReserves = 1_482_462_367921576n;
    const reserveRatio = 348n;
    const mintingAmount = 83760n;
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: originalBankReserves,
        circulatingStableCoin: SParse("0584cda232"),
        circulatingReserveCoin: SParse("05acdac7e612")
      }),
      mockOracleBox(SParse("05b8e68b8106"))
    );

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: originalBobBalance });

    expect(bank.reserveRatio).to.be.equal(reserveRatio);
    expect(() => {
      new TransactionBuilder(height)
        .from(bob.utxos)
        .extend(
          AgeUSDExchangePlugin(bank, {
            mint: "stable",
            amount: mintingAmount,
            recipient: bob.address
          })
        )
        .sendChangeTo(bob.address)
        .payFee(RECOMMENDED_MIN_FEE_VALUE)
        .build();
    }).to.throw("Unable to mint more than 0 stable coins.");
  });
});
