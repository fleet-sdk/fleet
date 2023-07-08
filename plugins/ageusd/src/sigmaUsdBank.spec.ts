import { describe, expect, test } from "vitest";
import { mockBankBox, mockOracleBox } from "./_tests/mocking";
import { SigmaUSDBank } from "./sigmaUsdBank";
import { SIGMA_USD_PARAMETERS } from "./sigmaUsdParameters";

describe("SigmaUSD Bank", () => {
  test("Constructor smoke test", () => {
    const bankBox = mockBankBox({
      reserveNanoergs: 1477201069508651n,
      circulatingStableCoin: 160402193n,
      circulatingReserveCoin: 1375438973n
    });
    const oracleBox = mockOracleBox(210526315n);

    const bank = new SigmaUSDBank(bankBox, oracleBox);

    expect(bank.bankBox).to.be.deep.equal(bankBox);
    expect(bank.oracleBox).to.be.deep.equal(oracleBox);
    expect(bank.params).to.be.deep.equal(SIGMA_USD_PARAMETERS);
  });
});
