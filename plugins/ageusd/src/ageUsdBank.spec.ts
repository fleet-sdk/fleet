import { Amount, Box, RECOMMENDED_MIN_FEE_VALUE, SBool, SConstant, SParse } from "@fleet-sdk/core";
import { describe, expect, it, test } from "vitest";
import { mockBankBox, mockOracleBox } from "./_test/mocking";
import { AgeUSDBank } from "./ageUsdBank";
import { AgeUSDBankParameters, SIGMA_USD_PARAMETERS } from "./sigmaUsdParameters";

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
    expect(bank.params).to.be.deep.equal(SIGMA_USD_PARAMETERS);

    expect(bank.stableCoin).to.be.deep.equal(_bankBox.assets[0]);
    expect(bank.reserveCoin).to.be.deep.equal(_bankBox.assets[1]);
    expect(bank.nft).to.be.deep.equal(_bankBox.assets[2]);
  });

  it("Should fail with incorrect bank parameters", () => {
    const params: AgeUSDBankParameters = {
      ...SIGMA_USD_PARAMETERS,
      tokens: {
        stableCoinTokenId: "9a06d9e545a41fd51eeffc5e20d818073bf820c635e2a9d922269913e0de369d",
        reserveCoinTokenId: "c5d6629329285b14ed3eac1dba0e07dbd1e61ee332c2039a7a9c04e8be0cb74e",
        nftTokenId: "de5ee573c6a492c129d51119649bfeaedfc9afa6f54af576e62e1f7f3bbd4207"
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
    wrongR4DataTypeIdgOracleBox.additionalRegisters.R4 = SConstant(SBool(true));
    expect(() => {
      new AgeUSDBank(_bankBox, wrongR4DataTypeIdgOracleBox, SIGMA_USD_PARAMETERS);
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

    expect(bank.stableCoinNominalPrice).to.be.equal(2105263n);
    expect(bank.reserveCoinNominalPrice).to.be.equal(828471n);
    expect(bank.reserveRatio).to.be.equal(437n);

    expect(bank.canRedeemStableCoinAmount(bank.circulatingStableCoins)).to.be.true;
    expect(bank.canRedeemStableCoinAmount(bank.circulatingStableCoins + 1n)).to.be.false;

    const availableStableCoin = bank.stableCoinAvailableAmount;
    expect(bank.getMintStableCoinReserveRatioFor(availableStableCoin)).to.be.equal(400n);
    expect(bank.canMintStableCoin(availableStableCoin)).to.be.true;
    expect(bank.canMintStableCoin(availableStableCoin * 2n)).to.be.false;

    const availableReserveCoin = bank.reserveCoinAvailableAmount;
    expect(bank.getMintReserveCoinReserveRatioFor(availableReserveCoin)).to.be.equal(800n);
    expect(bank.canMintReserveCoinAmount(availableReserveCoin)).to.be.true;
    expect(bank.canMintReserveCoinAmount(availableReserveCoin * 2n)).to.be.false;

    const redeemableReserveCoin = bank.reserveCoinRedeemableAmount;
    expect(bank.canRedeemReserveCoinAmount(redeemableReserveCoin)).to.be.true;
    expect(bank.getRedeemReserveCoinReserveRatioFor(redeemableReserveCoin)).to.be.equal(400n);
    expect(bank.canRedeemReserveCoinAmount(redeemableReserveCoin * 2n)).to.be.false;
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

    expect(bank.stableCoinNominalPrice).to.be.equal(2293577n);
    expect(bank.reserveCoinNominalPrice).to.be.equal(807096n);
    expect(bank.reserveRatio).to.be.equal(409n);

    const availableStableCoin = bank.stableCoinAvailableAmount;
    expect(bank.getMintStableCoinReserveRatioFor(availableStableCoin)).to.be.equal(400n);
    expect(bank.canMintStableCoin(availableStableCoin)).to.be.true;
    expect(bank.canMintStableCoin(availableStableCoin * 2n)).to.be.false;

    const availableReserveCoin = bank.reserveCoinAvailableAmount;
    expect(bank.getMintReserveCoinReserveRatioFor(availableReserveCoin)).to.be.equal(800n);
    expect(bank.canMintReserveCoinAmount(availableReserveCoin)).to.be.true;
    expect(bank.canMintReserveCoinAmount(availableReserveCoin * 2n)).to.be.false;

    const redeemableReserveCoin = bank.reserveCoinRedeemableAmount;
    expect(bank.canRedeemReserveCoinAmount(redeemableReserveCoin)).to.be.true;
    expect(bank.getRedeemReserveCoinReserveRatioFor(redeemableReserveCoin)).to.be.equal(400n);
    expect(bank.canRedeemReserveCoinAmount(redeemableReserveCoin * 2n)).to.be.false;
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

    expect(bank.stableCoinNominalPrice).to.be.equal(938105n); // lower price due to not enough reserve
    expect(bank.reserveCoinNominalPrice).to.be.equal(SIGMA_USD_PARAMETERS.defaultReserveCoinPrice);
    expect(bank.reserveRatio).to.be.equal(40n);
    expect(bank.stableCoinAvailableAmount).to.be.equal(0n);
    expect(bank.reserveCoinRedeemableAmount).to.be.equal(0n);

    const availableReserveCoin = bank.reserveCoinAvailableAmount;
    expect(availableReserveCoin).to.be.equal(2648469734n);
    expect(bank.getMintReserveCoinReserveRatioFor(availableReserveCoin)).to.be.equal(800n);
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

    expect(bank.stableCoinNominalPrice).to.be.equal(2293577n);
    expect(bank.reserveCoinNominalPrice).to.be.equal(10421622n);
    expect(bank.reserveRatio).to.be.equal(4090n);
    expect(bank.stableCoinAvailableAmount).to.be.equal(1920097470n);
    expect(bank.reserveCoinAvailableAmount).to.be.equal(0n);

    const availableStableCoin = bank.stableCoinAvailableAmount;
    expect(availableStableCoin).to.be.equal(1920097470n);
    expect(bank.getMintStableCoinReserveRatioFor(availableStableCoin)).to.be.equal(400n);

    const redeemableReserveCoin = bank.reserveCoinRedeemableAmount;
    expect(bank.getRedeemReserveCoinReserveRatioFor(redeemableReserveCoin)).to.be.equal(400n);
  });

  it("Should be able to mint reserve coins and redeem stable coin, but not mint stable. Reserve == 341", () => {
    const bankBox = mockBankBox({
      reserveNanoergs: 1_503_178_749_566_874n,
      circulatingStableCoin: SParse("05c4c9b035"),
      circulatingReserveCoin: SParse("05eac7f1db12")
    });
    const oracleBox = mockOracleBox(SParse("05ccadf6ee05"));
    const bank = new AgeUSDBank(bankBox, oracleBox, SIGMA_USD_PARAMETERS);

    expect(bank.stableCoinNominalPrice).to.be.equal(7_874_015n);
    expect(bank.reserveCoinNominalPrice).to.be.equal(422_904n);
    expect(bank.reserveRatio).to.be.equal(341n);
    expect(bank.circulatingStableCoins).to.be.equal(55_972_450n);
    expect(bank.circulatingReserveCoins).to.be.equal(2_512_269_813n);
    expect(bank.baseReserves).to.be.equal(1_503_178_749_566_874n);
    expect(bank.ergPriceInStableCoin).to.be.equal(127n);
    expect(bank.ergPriceInReserveCoin).to.be.equal(2364n);
    expect(bank.canMintReserveCoinAmount(3381618240n)).to.be.true;

    expect(bank.canMintReserveCoinAmount(1n)).to.be.true;
    expect(bank.canRedeemReserveCoinAmount(1n)).to.be.false;
    expect(bank.canMintStableCoin(1n)).to.be.false;
    expect(bank.canRedeemStableCoinAmount(bank.circulatingStableCoins)).to.be.true;

    const minerFee = RECOMMENDED_MIN_FEE_VALUE;
    const scAmount = 15000n;
    expect(bank.stableCoinNominalPrice * scAmount).to.be.equal(118110225000n);

    // mint stable coin
    expect(bank.getTotalStableCoinMintingCost(scAmount, minerFee)).to.be.equal(120734474359n);
    expect(bank.getStableCoinMintingFees(scAmount, minerFee)).to.be.equal(2604249359n);

    // redeem stable coin
    expect(bank.getTotalStableCoinRedeemingAmount(scAmount, minerFee)).to.be.equal(115515424459n);
    expect(bank.getRedeemingStableCoinFees(scAmount, minerFee)).to.be.equal(2604249359n);

    const rsAmount = 40504n;
    expect(bank.reserveCoinNominalPrice * rsAmount).to.be.equal(17129303616n);

    // mint reserve coin
    expect(bank.getTotalReserveCoinMintingCost(rsAmount, minerFee)).to.be.equal(17527933467n);
    expect(bank.getReserveCoinMintingFees(rsAmount, minerFee)).to.be.equal(378629851n);

    // redeem reserve coin
    expect(bank.getTotalReserveCoinRedeemingAmount(rsAmount, minerFee)).to.be.equal(16752044109n);
    expect(bank.getReserveCoinRedeemingFees(rsAmount, minerFee)).to.be.equal(377259507n);
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
    expect(bank.stableCoinNominalPrice).to.be.equal(229357798n / 100n);
    expect(Number(bank.reserveRatio)).to.be.greaterThanOrEqual(400);
  });
});
