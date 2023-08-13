import { RECOMMENDED_MIN_FEE_VALUE, SAFE_MIN_BOX_VALUE, TransactionBuilder } from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { parse } from "@fleet-sdk/serializer";
import { beforeEach, describe, expect, it } from "vitest";
import { mockBankBox, mockOracleBox } from "./_tests/mocking";
import { AgeUSDBankBox } from "./ageUsdBank";
import { AgeUSDExchangePlugin } from "./exchangePlugin";
import { SigmaUSDBank } from "./sigmaUsdBank";
import { SIGMA_USD_PARAMETERS } from "./sigmaUsdParameters";

describe("AgeUSD exchange plugin, reserve rate under 400%", () => {
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
  const implementor = chain.newParty("Implementor");

  beforeEach(() => {
    chain.clearUTxOSet();
  });

  it("Should mint reserve coin with reserve at 348%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_482_462_367921576n,
        circulatingStableCoin: parse("0584cda232"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("05b8e68b8106"))
    ).setImplementorFee({
      percentage: 11n,
      precision: 4n,
      address: implementor.address.encode()
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 40_000000000n });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const mintingAmount = 83760n;
    const baseCost = 35_798459457n;
    const uiFee = 39378305n;
    const totalCost = baseCost + uiFee;

    expect(bank.reserveRatio).to.be.equal(348n);
    expect(bank.stableCoinErgRate).to.be.equal(1_24n);
    expect(bank.reserveCoinErgRate).to.be.equal(2386n);

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
        circulatingStableCoin: parse("0584cda232"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("05b8e68b8106"))
    ).setImplementorFee({
      percentage: 11n,
      precision: 4n,
      address: implementor.address.encode()
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
          transactionFee: RECOMMENDED_MIN_FEE_VALUE
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

  it("Should redeem stable coin with reserve at 351%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_481_754_555029675n,
        circulatingStableCoin: parse("05d4d59732"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("0580a0f8fa05"))
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: 122_01n }]
    });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const reserveRatio = 351n;
    const redeemAmount = 121_00n;
    const baseAmount = 94_864000000n;
    const uiFee = 217219200n;
    const protocolFee = 1_936000000n;
    const totalAmount = baseAmount - uiFee;

    expect(bank.reserveRatio).to.be.equal(reserveRatio);
    expect(bank.getFeeAmountFor(redeemAmount, "stable", "protocol")).to.be.equal(protocolFee);
    expect(bank.getFeeAmountFor(redeemAmount, "stable", "implementor")).to.be.equal(uiFee);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "base")).to.be.equal(baseAmount);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "total")).to.be.equal(totalAmount);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "stable",
          amount: redeemAmount,
          recipient: bob.address,
          transactionFee: RECOMMENDED_MIN_FEE_VALUE
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5); // "bob_change + bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs - baseAmount,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount + redeemAmount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs + totalAmount - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBobBalance.tokens[0].amount - redeemAmount }
      ]
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });

  it("Should redeem all redeemable stable coin with reserve at 351%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_481_754_555029675n,
        circulatingStableCoin: parse("05d4d59732"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("0580a0f8fa05"))
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: bank.redeemableStableCoins }]
    });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const reserveRatio = 351n;
    const redeemAmount = bank.redeemableStableCoins;
    const baseAmount = 412_561_952320000n;
    const uiFee = 944_682674496n;
    const protocolFee = 8_419_631680000n;
    const totalAmount = baseAmount - uiFee;

    expect(bank.reserveRatio).to.be.equal(reserveRatio);
    expect(bank.getFeeAmountFor(redeemAmount, "stable", "protocol")).to.be.equal(protocolFee);
    expect(bank.getFeeAmountFor(redeemAmount, "stable", "implementor")).to.be.equal(uiFee);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "base")).to.be.equal(baseAmount);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "total")).to.be.equal(totalAmount);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "stable",
          amount: redeemAmount,
          recipient: bob.address,
          transactionFee: RECOMMENDED_MIN_FEE_VALUE
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5); // "bob_change + bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs - baseAmount,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount + redeemAmount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs + totalAmount - RECOMMENDED_MIN_FEE_VALUE,
      tokens: []
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });

  it("Should not more than redeemable stable coin amount", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_481_754_555029675n,
        circulatingStableCoin: parse("05d4d59732"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("0580a0f8fa05"))
    );

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: bank.redeemableStableCoins }]
    });

    expect(bank.reserveRatio).to.be.equal(351n);
    expect(() => {
      new TransactionBuilder(height)
        .from(bob.utxos)
        .extend(
          AgeUSDExchangePlugin(bank, {
            redeem: "stable",
            amount: bank.redeemableStableCoins * 2n,
            recipient: bob.address,
            transactionFee: RECOMMENDED_MIN_FEE_VALUE
          })
        )
        .sendChangeTo(bob.address)
        .build();
    }).to.throw("Unable to redeem more than 52622698 stable coins.");
  });

  it("Should not mint stable coin with reserve at 348%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_482_462_367921576n,
        circulatingStableCoin: parse("0584cda232"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("05b8e68b8106"))
    );

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 40_000000000n });

    expect(bank.reserveRatio).to.be.equal(348n);
    expect(() => {
      new TransactionBuilder(height)
        .from(bob.utxos)
        .extend(
          AgeUSDExchangePlugin(bank, {
            redeem: "reserve",
            amount: 83760n,
            recipient: bob.address
          })
        )
        .sendChangeTo(bob.address)
        .payFee(RECOMMENDED_MIN_FEE_VALUE)
        .build();
    }).to.throw("Unable to redeem more than 0 reserve coins.");
  });

  it("Should not redeem reserve coin with reserve at 348%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1_482_462_367921576n,
        circulatingStableCoin: parse("0584cda232"),
        circulatingReserveCoin: parse("05acdac7e612")
      }),
      mockOracleBox(parse("05b8e68b8106"))
    );

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 40_000000000n });

    expect(bank.reserveRatio).to.be.equal(348n);
    expect(() => {
      new TransactionBuilder(height)
        .from(bob.utxos)
        .extend(
          AgeUSDExchangePlugin(bank, {
            mint: "stable",
            amount: 83760n,
            recipient: bob.address
          })
        )
        .sendChangeTo(bob.address)
        .payFee(RECOMMENDED_MIN_FEE_VALUE)
        .build();
    }).to.throw("Unable to mint more than 0 stable coins.");
  });
});

describe("AgeUSD exchange plugin, reserve rate between 400% and 800%", () => {
  const height = 1036535;

  const chain = new MockChain(height);
  const tokens = SIGMA_USD_PARAMETERS.tokens;
  chain.assetsMetadata.set("nanoerg", { name: "ERG", decimals: 9 });
  chain.assetsMetadata.set(tokens.stableCoinId, { name: "SigUSD", decimals: 2 });
  chain.assetsMetadata.set(tokens.reserveCoinId, { name: "SigRSV" });
  chain.assetsMetadata.set(tokens.nftId, { name: "SUSD Bank V2 NFT" });
  const bankParty = chain.newParty({
    name: "SigmaUSD Bank",
    ergoTree: SIGMA_USD_PARAMETERS.contract
  });
  const bob = chain.newParty("Bob");
  const implementor = chain.newParty("Implementor");

  beforeEach(() => {
    chain.clearUTxOSet();
  });

  it("Should mint reserve coin with reserve at 437%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    ).setImplementorFee({
      percentage: 11n,
      precision: 4n,
      address: implementor.address.encode()
    });
    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 100_000000000n });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const mintingAmount = 83760n;
    const baseCost = 70780585579n;
    const uiFee = 77858644n;
    const totalCost = baseCost + uiFee;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(mintingAmount, "reserve", "protocol")).to.be.equal(1387854619n);
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

  it("Should mint stable coin with reserve at 437%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });
    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 200_000000000n });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const mintingAmount = 837_60n;
    const baseCost = 179_863565457n;
    const uiFee = 395699844n;
    const totalCost = baseCost + uiFee;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(mintingAmount, "stable", "protocol")).to.be.equal(3_526736577n);
    expect(bank.getFeeAmountFor(mintingAmount, "stable", "implementor")).to.be.equal(uiFee);
    expect(bank.getMintingCostFor(mintingAmount, "stable", "base")).to.be.equal(baseCost);
    expect(bank.getMintingCostFor(mintingAmount, "stable", "total")).to.be.equal(totalCost);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          mint: "stable",
          amount: mintingAmount,
          recipient: bob.address
        })
      )
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5);
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs + baseCost,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount - mintingAmount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs - totalCost - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: mintingAmount }]
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });

  it("Should mint all available stable coin with reserve at 437%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });
    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 200_000_000000000n });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const mintingAmount = bank.availableStableCoins;
    const baseCost = 43_280_125680306n;
    const uiFee = 95_216276496n;
    const totalCost = baseCost + uiFee;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(mintingAmount, "stable", "protocol")).to.be.equal(848_629915300n);
    expect(bank.getFeeAmountFor(mintingAmount, "stable", "implementor")).to.be.equal(uiFee);
    expect(bank.getMintingCostFor(mintingAmount, "stable", "base")).to.be.equal(baseCost);
    expect(bank.getMintingCostFor(mintingAmount, "stable", "total")).to.be.equal(totalCost);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          mint: "stable",
          amount: mintingAmount,
          recipient: bob.address
        })
      )
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5);
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs + baseCost,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount - mintingAmount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs - totalCost - RECOMMENDED_MIN_FEE_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: mintingAmount }]
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });

  it("Should redeem stable coin with reserve at 437%", () => {
    bankParty.utxos.clear();
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: 122_01n }]
    });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const redeemAmount = 121_00n;
    const baseAmount = 24_964208654n;
    const uiFee = 57162943n;
    const protocolFee = 509473646n;
    const totalAmount = baseAmount - uiFee;
    const networkFee = RECOMMENDED_MIN_FEE_VALUE * 3n;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(redeemAmount, "stable", "protocol")).to.be.equal(protocolFee);
    expect(bank.getFeeAmountFor(redeemAmount, "stable", "implementor")).to.be.equal(uiFee);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "base")).to.be.equal(baseAmount);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "total")).to.be.equal(totalAmount);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "stable",
          amount: redeemAmount,
          recipient: bob.address,
          transactionFee: networkFee
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5); // "bob_change + bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs - baseAmount,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount + redeemAmount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs + totalAmount - networkFee,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBobBalance.tokens[0].amount - redeemAmount }
      ]
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });

  it("Should redeem all redeemable stable coin with reserve at 437%", () => {
    bankParty.utxos.clear();
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokens.stableCoinId, amount: bank.circulatingStableCoins }]
    });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const redeemAmount = bank.redeemableStableCoins;
    const baseAmount = 330_935_026000924n;
    const uiFee = 757_773671781n;
    const protocolFee = 6_753_776040835n;
    const totalAmount = baseAmount - uiFee;
    const networkFee = RECOMMENDED_MIN_FEE_VALUE * 3n;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(redeemAmount, "stable", "protocol")).to.be.equal(protocolFee);
    expect(bank.getFeeAmountFor(redeemAmount, "stable", "implementor")).to.be.equal(uiFee);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "base")).to.be.equal(baseAmount);
    expect(bank.getRedeemingAmountFor(redeemAmount, "stable", "total")).to.be.equal(totalAmount);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "stable",
          amount: redeemAmount,
          recipient: bob.address,
          transactionFee: networkFee
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5); // "bob_change + bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs - baseAmount,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount + redeemAmount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs + totalAmount - networkFee,
      tokens: []
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });

  it("Should redeem reserve coin with reserve at 437%", () => {
    bankParty.utxos.clear();
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    );

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [{ tokenId: tokens.reserveCoinId, amount: 12201n }]
    });

    const prevBobBalance = bob.balance;
    const prevBankBalance = bankParty.balance;

    const redeemAmount = 12100n;
    const baseAmount = 9_824009118n;
    const protocolFee = 200489982n;
    const totalAmount = baseAmount;
    const networkFee = RECOMMENDED_MIN_FEE_VALUE * 3n;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(redeemAmount, "reserve", "protocol")).to.be.equal(protocolFee);
    expect(bank.getRedeemingAmountFor(redeemAmount, "reserve", "base")).to.be.equal(baseAmount);
    expect(bank.getRedeemingAmountFor(redeemAmount, "reserve", "total")).to.be.equal(totalAmount);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "reserve",
          amount: redeemAmount,
          recipient: bob.address,
          transactionFee: networkFee
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(4); // "bob_change + bank_change + exchange_output + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs - baseAmount,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount + redeemAmount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: prevBobBalance.nanoergs + totalAmount - networkFee,
      tokens: [
        { tokenId: tokens.reserveCoinId, amount: prevBobBalance.tokens[0].amount - redeemAmount }
      ]
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: 0n, tokens: [] });
  });

  it("Should redeem all redeemable reserve coin with reserve at 437%", () => {
    bankParty.utxos.clear();
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    ).setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: implementor.address.encode()
    });

    const networkFee = RECOMMENDED_MIN_FEE_VALUE * 3n;

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({
      nanoergs: SAFE_MIN_BOX_VALUE + networkFee,
      tokens: [{ tokenId: tokens.reserveCoinId, amount: bank.redeemableReserveCoins }]
    });

    const prevBankBalance = bankParty.balance;

    const redeemAmount = bank.redeemableReserveCoins;
    const baseAmount = 124_322_461913564n;
    const uiFee = 284_673_065_851n;
    const protocolFee = 2_537_193100276n;
    const totalAmount = baseAmount - uiFee;

    expect(bank.stableCoinErgRate).to.be.equal(4_75n);
    expect(bank.reserveCoinErgRate).to.be.equal(1207n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.getFeeAmountFor(redeemAmount, "reserve", "protocol")).to.be.equal(protocolFee);
    expect(bank.getFeeAmountFor(redeemAmount, "reserve", "implementor")).to.be.equal(uiFee);
    expect(bank.getRedeemingAmountFor(redeemAmount, "reserve", "base")).to.be.equal(baseAmount);
    expect(bank.getRedeemingAmountFor(redeemAmount, "reserve", "total")).to.be.equal(totalAmount);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "reserve",
          amount: redeemAmount,
          recipient: bob.address
        })
      )
      .payFee(networkFee)
      .sendChangeTo(bob.address)
      .build();

    expect(transaction.outputs).to.have.length(5); // "bob_change + bank_change + exchange_output + implementor_fee + network_fee"
    expect(chain.execute(transaction)).to.be.true;

    expect(bankParty.balance).to.be.deep.equal({
      nanoergs: prevBankBalance.nanoergs - baseAmount,
      tokens: [
        { tokenId: tokens.stableCoinId, amount: prevBankBalance.tokens[0].amount },
        { tokenId: tokens.reserveCoinId, amount: prevBankBalance.tokens[1].amount + redeemAmount },
        { tokenId: tokens.nftId, amount: prevBankBalance.tokens[2].amount }
      ]
    });

    expect(bob.balance).to.be.deep.equal({
      nanoergs: 124_037_789847713n,
      tokens: []
    });

    expect(implementor.balance).to.be.deep.equal({ nanoergs: uiFee, tokens: [] });
  });
});

describe("AgeUSD exchange plugin, reserve rate over 800%", () => {
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
  chain.newParty("Implementor");

  beforeEach(() => {
    chain.clearUTxOSet();
  });

  it("Should not mint reserve coin with reserve at 918%", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 3_100_000_000000000n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    );

    bankParty.addUTxOs(bank.bankBox);
    bob.addBalance({ nanoergs: 200_000000000n });

    expect(bank.reserveRatio).to.be.equal(918n);
    expect(() => {
      new TransactionBuilder(height)
        .from(bob.utxos)
        .extend(
          AgeUSDExchangePlugin(bank, {
            mint: "reserve",
            amount: 83760n,
            recipient: bob.address
          })
        )
        .sendChangeTo(bob.address)
        .payFee(RECOMMENDED_MIN_FEE_VALUE)
        .build();
    }).to.throw("Unable to mint more than 0 reserve coins.");
  });
});
