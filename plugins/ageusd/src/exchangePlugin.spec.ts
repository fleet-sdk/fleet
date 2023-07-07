import { RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { afterAll, describe, expect, it } from "vitest";
import { mockBankBox, mockOracleBox } from "./_tests/mocking";
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

  afterAll(() => {
    bob.utxos.clear();
    bankParty.utxos.clear();
  });

  it("Should mint reserve coin", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    );

    // .setImplementorFee({
    //   percentage: 2n,
    //   address: "9fB6AxKB8fLaSZzCRrcVmojkYnS3noq7kxcgd3oRqdTpL3FrmpD"
    // });

    bob.addBalance({ nanoergs: bank.getMintingCostFor(10000n, "reserve", "total") + 2100000n });
    bankParty.addUTxOs(bank.bankBox);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos)
      .extend(
        AgeUSDExchangePlugin(bank, {
          mint: "reserve",
          amount: 10000n,
          recipient: bob.address,
          fee: RECOMMENDED_MIN_FEE_VALUE
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(chain.execute(transaction, { log: true })).to.be.true;
  });
});
