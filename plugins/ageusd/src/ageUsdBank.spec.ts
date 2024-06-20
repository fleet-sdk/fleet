import { percent } from "@fleet-sdk/common";
import { Amount, Box, RECOMMENDED_MIN_FEE_VALUE } from "@fleet-sdk/core";
import { parse, SBool } from "@fleet-sdk/serializer";
import { describe, expect, it, test } from "vitest";
import { mockBankBox, mockOracleBox } from "./_tests/mocking";
import { AgeUSDBank } from "./ageUsdBank";
import {
  AgeUSDBankParameters,
  SIGMA_USD_PARAMETERS
} from "./sigmaUsdParameters";

describe("Bank construction", () => {
  const _bankBox = mockBankBox({
    reserveNanoergs: 1477201069508651n,
    circulatingStableCoin: 160402193n,
    circulatingReserveCoin: 1375438973n
  });
  const _oracleBox = mockOracleBox(210526315n);

  it("Should construct correctly", () => {
    const bank = new AgeUSDBank(_bankBox, _oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.bankBox).to.be.deep.equal(_bankBox);
    expect(bank.oracleBox).to.be.deep.equal(_oracleBox);
    expect(bank.oracleRate).to.be.equal(2105263n);
    expect(bank.params).to.be.deep.equal(SIGMA_USD_PARAMETERS);

    expect(bank.stableCoin).to.be.deep.equal(_bankBox.assets[0]);
    expect(bank.reserveCoin).to.be.deep.equal(_bankBox.assets[1]);
    expect(bank.nft).to.be.deep.equal(_bankBox.assets[2]);

    expect(bank.getAvailable("stable")).to.be.equal(bank.availableStableCoins);
    expect(bank.getAvailable("reserve")).to.be.equal(
      bank.availableReserveCoins
    );
    expect(bank.getRedeemable("stable")).to.be.equal(
      bank.redeemableStableCoins
    );
    expect(bank.getRedeemable("reserve")).to.be.equal(
      bank.redeemableReserveCoins
    );

    expect(bank.getImplementorFee(100n)).to.be.equal(0n); // no configured UI fee, should be zero

    const customOracle: AgeUSDBankParameters = {
      ...SIGMA_USD_PARAMETERS,
      oracle: { nftId: SIGMA_USD_PARAMETERS.oracle.nftId }
    };
    const customOracleBank = new AgeUSDBank(_bankBox, _oracleBox, customOracle);

    expect(customOracleBank.oracleRate).to.be.equal(210526315n);
  });

  it("Should set percentage based UI fee parameters", () => {
    const bank = new AgeUSDBank(_bankBox, _oracleBox, SIGMA_USD_PARAMETERS);
    bank.setImplementorFee({
      percentage: 20n,
      precision: 4n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    expect(bank.implementorAddress).to.be.equal(
      "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    );
    expect(bank.getImplementorFee(1500n)).to.be.equal(3n);

    bank.setImplementorFee({
      percentage: 20n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    expect(bank.implementorAddress).to.be.equal(
      "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    );
    expect(bank.getImplementorFee(1500n)).to.be.equal(30n);

    bank.setImplementorFee({
      percentage: 0n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    expect(bank.implementorAddress).to.be.equal(
      "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    );
    expect(bank.getImplementorFee(1501232310n)).to.be.equal(0n);
  });

  it("Should set callback based UI fee parameters", () => {
    const bank = new AgeUSDBank(_bankBox, _oracleBox, SIGMA_USD_PARAMETERS);
    // percentage
    bank.setImplementorFee({
      callback: (amount) => percent(amount, 2n),
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    expect(bank.implementorAddress).to.be.equal(
      "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    );
    expect(bank.getImplementorFee(1500n)).to.be.equal(30n);

    // flat fee
    bank.setImplementorFee({
      callback: () => 100n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    expect(bank.implementorAddress).to.be.equal(
      "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    );
    expect(bank.getImplementorFee(1500n)).to.be.equal(100n);
    expect(bank.getImplementorFee(1n)).to.be.equal(100n);
    expect(bank.getImplementorFee(1123n)).to.be.equal(100n);
  });

  it("Should fail with incorrect bank parameters", () => {
    const params: AgeUSDBankParameters = {
      ...SIGMA_USD_PARAMETERS,
      tokens: {
        stableCoinId:
          "9a06d9e545a41fd51eeffc5e20d818073bf820c635e2a9d922269913e0de369d",
        reserveCoinId:
          "c5d6629329285b14ed3eac1dba0e07dbd1e61ee332c2039a7a9c04e8be0cb74e",
        nftId:
          "de5ee573c6a492c129d51119649bfeaedfc9afa6f54af576e62e1f7f3bbd4207"
      }
    };

    expect(() => {
      new AgeUSDBank(_bankBox, _oracleBox, params);
    }).to.throw("Invalid bank box.");
  });

  it("Should fail with incorrect bank box", () => {
    const newBankBox = () =>
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      });

    const emptyAssetsBankBox = newBankBox();
    emptyAssetsBankBox.assets = [];
    expect(() => {
      new AgeUSDBank(emptyAssetsBankBox, _oracleBox, SIGMA_USD_PARAMETERS);
    }).to.throw("Invalid bank box.");

    const wrongContractBankBox = newBankBox();
    wrongContractBankBox.ergoTree += "00";
    expect(() => {
      new AgeUSDBank(wrongContractBankBox, _oracleBox, SIGMA_USD_PARAMETERS);
    }).to.throw("Invalid bank box.");

    const wrongNftIdBankBox = newBankBox();
    wrongNftIdBankBox.assets[2].tokenId =
      "c5d6629329285b14ed3eac1dba0e07dbd1e61ee332c2039a7a9c04e8be0cb74e";
    expect(() => {
      new AgeUSDBank(wrongNftIdBankBox, _oracleBox, SIGMA_USD_PARAMETERS);
    }).to.throw("Invalid bank box.");
  });

  it("Should fail with incorrect oracle box", () => {
    const wrongNftIdgOracleBox = mockOracleBox(210526315n);
    wrongNftIdgOracleBox.assets[0].tokenId =
      "1c51c3a53abfe87e6db9a03c649e8360f255ffc4bd34303d30fc7db23ae551db";
    expect(() => {
      new AgeUSDBank(_bankBox, wrongNftIdgOracleBox, SIGMA_USD_PARAMETERS);
    }).to.throw("Invalid oracle box.");

    const undefinedR4IdgOracleBox = mockOracleBox(210526315n);
    (undefinedR4IdgOracleBox as Box<Amount>).additionalRegisters.R4 = undefined;
    expect(() => {
      new AgeUSDBank(_bankBox, undefinedR4IdgOracleBox, SIGMA_USD_PARAMETERS);
    }).to.throw("Invalid oracle box.");

    const wrongR4DataTypeIdgOracleBox = mockOracleBox(210526315n);
    wrongR4DataTypeIdgOracleBox.additionalRegisters.R4 = SBool(true).toHex();
    expect(() => {
      new AgeUSDBank(
        _bankBox,
        wrongR4DataTypeIdgOracleBox,
        SIGMA_USD_PARAMETERS
      );
    }).to.throw("Invalid oracle box.");
  });
});

describe("Bank calculations", () => {
  it("Should be able to mint stable and reserve coins and redeem reserve coin. Reserve == 437", () => {
    // test vectors from AppKit: https://github.com/ergoplatform/ergo-appkit/pull/158/files

    const bankBox = mockBankBox({
      reserveNanoergs: 1477201069508651n,
      circulatingStableCoin: 160402193n,
      circulatingReserveCoin: 1375438973n
    });
    const oracleBox = mockOracleBox(210526315n);
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.stableCoinPrice).to.be.equal(2105263n);
    expect(bank.reserveCoinPrice).to.be.equal(828471n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.canRedeem(bank.circulatingStableCoins, "stable")).to.be.true;
    expect(bank.canRedeem(bank.circulatingStableCoins + 1n, "stable")).to.be
      .false;

    const availableStableCoin = bank.availableStableCoins;
    expect(
      bank.getReserveRatioFor("minting", availableStableCoin, "stable")
    ).to.be.equal(400n);
    expect(bank.canMint(availableStableCoin, "stable")).to.be.true;
    expect(bank.canMint(availableStableCoin * 2n, "stable")).to.be.false;

    const availableReserve = bank.availableReserveCoins;
    expect(
      bank.getReserveRatioFor("minting", availableReserve, "reserve")
    ).to.be.equal(800n);
    expect(bank.canMint(availableReserve, "reserve")).to.be.true;
    expect(bank.canMint(availableReserve * 2n, "reserve")).to.be.false;

    const redeemableReserve = bank.redeemableReserveCoins;
    expect(bank.canRedeem(redeemableReserve, "reserve")).to.be.true;
    expect(
      bank.getReserveRatioFor("redeeming", redeemableReserve, "reserve")
    ).to.be.equal(400n);
    expect(bank.canRedeem(redeemableReserve * 2n, "reserve")).to.be.false;
  });

  it("Should be able to mint stable and reserve coins and redeem reserve coin. Reserve == 409", () => {
    // test vectors from AppKit: https://github.com/ergoplatform/ergo-appkit/pull/158/files

    const bankBox = mockBankBox({
      reserveNanoergs: 1454615342036303n,
      circulatingStableCoin: 155058786n,
      circulatingReserveCoin: 1361641506n
    });
    const oracleBox = mockOracleBox(229357798n);
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.stableCoinPrice).to.be.equal(2293577n);
    expect(bank.reserveCoinPrice).to.be.equal(807096n);
    expect(bank.reserveRatio).to.be.equal(409n);

    const availableStableCoin = bank.availableStableCoins;
    expect(
      bank.getReserveRatioFor("minting", availableStableCoin, "stable")
    ).to.be.equal(400n);
    expect(bank.canMint(availableStableCoin, "stable")).to.be.true;
    expect(bank.canMint(availableStableCoin * 2n, "stable")).to.be.false;

    const availableReserve = bank.availableReserveCoins;
    expect(
      bank.getReserveRatioFor("minting", availableReserve, "reserve")
    ).to.be.equal(800n);
    expect(bank.canMint(availableReserve, "reserve")).to.be.true;
    expect(bank.canMint(availableReserve * 2n, "reserve")).to.be.false;

    const redeemableReserve = bank.redeemableReserveCoins;
    expect(bank.canRedeem(redeemableReserve, "reserve")).to.be.true;
    expect(
      bank.getReserveRatioFor("redeeming", redeemableReserve, "reserve")
    ).to.be.equal(400n);
    expect(bank.canRedeem(redeemableReserve * 2n, "reserve")).to.be.false;
  });

  test("Low bank reserve", () => {
    // test vectors from AppKit: https://github.com/ergoplatform/ergo-appkit/pull/158/files

    const bankBox = mockBankBox({
      reserveNanoergs: 145461534203630n,
      circulatingStableCoin: 155058786n,
      circulatingReserveCoin: 1361641506n
    });
    const oracleBox = mockOracleBox(229357798n);
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.stableCoinPrice).to.be.equal(938105n); // lower price due to not enough reserve
    expect(bank.reserveCoinPrice).to.be.equal(
      SIGMA_USD_PARAMETERS.defaultReserveCoinPrice
    );
    expect(bank.reserveRatio).to.be.equal(40n);
    expect(bank.availableStableCoins).to.be.equal(0n);
    expect(bank.redeemableReserveCoins).to.be.equal(0n);

    const availableReserveCoin = bank.availableReserveCoins;
    expect(availableReserveCoin).to.be.equal(2648469734n);
    expect(
      bank.getReserveRatioFor("minting", availableReserveCoin, "reserve")
    ).to.be.equal(800n);
  });

  test("High bank reserve", () => {
    // test vectors from AppKit: https://github.com/ergoplatform/ergo-appkit/pull/158/files

    const bankBox = mockBankBox({
      reserveNanoergs: 14546153420363000n,
      circulatingStableCoin: 155058786n,
      circulatingReserveCoin: 1361641506n
    });
    const oracleBox = mockOracleBox(229357798n);
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.stableCoinPrice).to.be.equal(2293577n);
    expect(bank.reserveCoinPrice).to.be.equal(10421622n);
    expect(bank.reserveRatio).to.be.equal(4090n);
    expect(bank.availableStableCoins).to.be.equal(1920097470n);
    expect(bank.availableReserveCoins).to.be.equal(0n);

    const availableStable = bank.availableStableCoins;
    expect(availableStable).to.be.equal(1920097470n);
    expect(
      bank.getReserveRatioFor("minting", availableStable, "stable")
    ).to.be.equal(400n);

    const redeemableReserve = bank.redeemableReserveCoins;
    expect(
      bank.getReserveRatioFor("redeeming", redeemableReserve, "reserve")
    ).to.be.equal(400n);
  });

  it("Should be able to mint reserve coins and redeem stable coin, but not mint stable. Reserve == 347, sigmausd.io", () => {
    const bankBox = mockBankBox({
      reserveNanoergs: 1_482_462_367_921_576n,
      circulatingStableCoin: parse("0584cda232"),
      circulatingReserveCoin: parse("05acdac7e612")
    });
    const oracleBox = mockOracleBox(parse("05b096ee8406"));
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    bank.setImplementorFee({
      percentage: 6n,
      precision: 3n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    expect(bank.stableCoinPrice).to.be.equal(8_104_032n);
    expect(bank.reserveCoinPrice).to.be.equal(418_187n);
    expect(bank.reserveRatio).to.be.equal(347n);
    expect(bank.circulatingStableCoins).to.be.equal(527_122_58n);
    expect(bank.circulatingReserveCoins).to.be.equal(2_523_461_270n);
    expect(bank.baseReserves).to.be.equal(1_482_462_367_921_576n);
    expect(bank.stableCoinErgRate).to.be.equal(123n);
    expect(bank.reserveCoinErgRate).to.be.equal(2391n);

    expect(bank.canMint(3294316566n, "reserve")).to.be.true;
    expect(bank.canRedeem(1n, "reserve")).to.be.false;
    expect(bank.canMint(1n, "stable")).to.be.false;
    expect(bank.canRedeem(527_122_58n, "stable")).to.be.true;
    expect(
      bank.getReserveRatioFor("redeeming", 100_000_00n, "stable")
    ).to.be.equal(405n);

    expect(bank.availableReserveCoins).to.be.equal(4538344221n);
    expect(bank.availableStableCoins).to.be.equal(0n);

    expect(bank.redeemableReserveCoins).to.be.equal(0n);
    expect(bank.redeemableStableCoins).to.be.equal(527_122_58n);

    const txFee = RECOMMENDED_MIN_FEE_VALUE;
    const stable = 15000n;
    expect(bank.stableCoinPrice * stable).to.be.equal(121_560_480_000n);

    // mint stable coin
    expect(bank.getFeeAmountFor(stable, "stable", "all")).to.be.equal(
      3_175_159_737n
    );
    expect(bank.getFeeAmountFor(stable, "stable", "all", txFee)).to.be.equal(
      3176259737n
    );
    expect(
      bank.getMintingCostFor(stable, "stable", "total", txFee)
    ).to.be.equal(124_736739737n);

    // redeem stable coin
    expect(bank.getFeeAmountFor(stable, "stable", "all")).to.be.equal(
      3_175_159_737n
    );
    expect(
      bank.getRedeemingAmountFor(stable, "stable", "total", txFee)
    ).to.be.equal(118384220263n);

    const reserve = 40504n;
    expect(bank.reserveCoinPrice * reserve).to.be.equal(16938246248n);

    // mint reserve coin
    expect(bank.getFeeAmountFor(reserve, "reserve", "all")).to.be.equal(
      442426991n
    );
    expect(
      bank.getMintingCostFor(reserve, "reserve", "total", txFee)
    ).to.be.equal(17_381773239n);

    // redeem reserve coin
    expect(bank.getFeeAmountFor(reserve, "reserve", "all")).to.be.equal(
      442_426_991n
    );
    expect(bank.getRedeemingAmountFor(reserve, "reserve", "total")).to.be.equal(
      16495819257n
    );
  });

  it("Should be able to mint reserve coins and redeem stable coin, but not mint stable. Reserve == 345, tokenjay", () => {
    const bankBox = mockBankBox({
      reserveNanoergs: 1_482_462_367921576n,
      circulatingStableCoin: parse("0584cda232"),
      circulatingReserveCoin: parse("05acdac7e612")
    });
    const oracleBox = mockOracleBox(parse("058494ac8706"));
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.stableCoinPrice).to.be.equal(8130081n);
    expect(bank.reserveCoinPrice).to.be.equal(417643n);
    expect(bank.reserveRatio).to.be.equal(345n);
    expect(bank.circulatingStableCoins).to.be.equal(527_122_58n);
    expect(bank.circulatingReserveCoins).to.be.equal(2_523461270n);
    expect(bank.baseReserves).to.be.equal(1_482_462_367921576n);
    expect(bank.stableCoinErgRate).to.be.equal(123n);
    expect(bank.reserveCoinErgRate).to.be.equal(2394n);

    expect(bank.canMint(bank.availableReserveCoins, "reserve")).to.be.true;
    expect(bank.canRedeem(1n, "reserve")).to.be.false;
    expect(bank.canMint(1n, "stable")).to.be.false;
    expect(bank.canRedeem(bank.redeemableStableCoins, "stable")).to.be.true;

    expect(bank.availableReserveCoins).to.be.equal(4_576481568n);
    expect(bank.availableStableCoins).to.be.equal(0n);

    expect(bank.redeemableReserveCoins).to.be.equal(0n);
    expect(bank.redeemableStableCoins).to.be.equal(52712258n);

    const stable = 15000n;
    expect(bank.stableCoinPrice * stable).to.be.equal(121_951215000n);

    bank.setImplementorFee({
      percentage: 22n,
      precision: 4n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    // redeem stable coin
    expect(bank.getFeeAmountFor(stable, "stable", "protocol")).to.be.equal(
      2_439024300n
    );
    expect(bank.getFeeAmountFor(stable, "stable", "implementor")).to.be.equal(
      273658526n
    );
    expect(bank.getRedeemingAmountFor(stable, "stable", "total")).to.be.equal(
      119_238532174n
    );
    expect(
      bank.getReserveRatioFor("redeeming", 100_000_00n, "stable")
    ).to.be.equal(403n);

    bank.setImplementorFee({
      percentage: 11n,
      precision: 4n,
      address: "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin"
    });

    const reserve = 405040n;
    expect(bank.reserveCoinPrice * reserve).to.be.equal(169162120720n);

    // mint reserve coin
    expect(bank.getFeeAmountFor(reserve, "reserve", "protocol")).to.be.equal(
      3383242414n
    );
    expect(bank.getFeeAmountFor(reserve, "reserve", "implementor")).to.be.equal(
      189799899n
    );
    expect(bank.getMintingCostFor(reserve, "reserve", "total")).to.be.equal(
      172735163033n
    );
  });

  it("Should return base reserve and reserve ration equal to zero if bank box value is under min value", () => {
    const bankBox = mockBankBox({
      reserveNanoergs: SIGMA_USD_PARAMETERS.minBoxValue - 1n, // reserve under min value
      circulatingStableCoin: 155058786n,
      circulatingReserveCoin: 1361641506n
    });
    const oracleBox = mockOracleBox(229357798n);
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.baseReserves).to.be.equal(0n);
    expect(bank.reserveRatio).to.be.equal(0n);
  });

  it("Should return liabilities equal to zero if there is no stable coin in circulation", () => {
    const bankBox = mockBankBox({
      reserveNanoergs: SIGMA_USD_PARAMETERS.minBoxValue,
      circulatingStableCoin: 0n,
      circulatingReserveCoin: 1361641506n
    });
    const oracleBox = mockOracleBox(229357798n);
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.liabilities).to.be.equal(0n);
    expect(bank.stableCoinPrice).to.be.equal(229357798n / 100n);
    expect(Number(bank.reserveRatio)).to.be.greaterThanOrEqual(400);
  });
});
