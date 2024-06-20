import { AgeUSDBank, type AgeUSDBankBox, type OracleBox } from "./ageUsdBank";
import { SIGMA_USD_PARAMETERS } from "./sigmaUsdParameters";

export class SigmaUSDBank extends AgeUSDBank {
  constructor(bankBox: AgeUSDBankBox, oracleBox: OracleBox) {
    super(bankBox, oracleBox, SIGMA_USD_PARAMETERS);
  }
}
