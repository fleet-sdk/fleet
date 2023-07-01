import { RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { describe, expect, it } from "vitest";
import { mockBankBox, mockOracleBox } from "./_tests/mocking";
import { AgeUSDExchangePlugin } from "./exchangePlugin";
import { SigmaUSDBank } from "./sigmaUsdBank";
import { SIGMA_USD_PARAMETERS } from "./sigmaUsdParameters";

describe("AgeUSD exchange plugin", () => {
  const height = 1036535;

  it("Should mint reserve", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    );

    const chain = new MockChain(height);

    const sigTokens = SIGMA_USD_PARAMETERS.tokens;
    chain.assetsMetadata.set("nanoerg", { name: "ERG", decimals: 9 });
    chain.assetsMetadata.set(sigTokens.stableCoinId, { name: "SigUSD", decimals: 2 });
    chain.assetsMetadata.set(sigTokens.reserveCoinId, { name: "SigRSV" });
    chain.assetsMetadata.set(sigTokens.nftId, { name: "SUSD Bank V2 NFT" });

    const bob = chain.newParty("Bob").withBalance({ nanoergs: 100000000000n });
    const bankParty = chain
      .newParty({ name: "SigmaUSD Bank", ergoTree: SIGMA_USD_PARAMETERS.contract })
      .withUTxOs(bank.bankBox);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos.toArray())
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

    expect(chain.execute(transaction)).to.be.true;
  });

  it("Should redeem stable", () => {
    const bank = new SigmaUSDBank(
      mockBankBox({
        reserveNanoergs: 1477201069508651n,
        circulatingStableCoin: 160402193n,
        circulatingReserveCoin: 1375438973n
      }),
      mockOracleBox(210526315n)
    );

    const chain = new MockChain(height);

    const sigTokens = SIGMA_USD_PARAMETERS.tokens;
    chain.assetsMetadata.set("nanoerg", { name: "ERG", decimals: 9 });
    chain.assetsMetadata.set(sigTokens.stableCoinId, { name: "SigUSD", decimals: 2 });
    chain.assetsMetadata.set(sigTokens.reserveCoinId, { name: "SigRSV" });
    chain.assetsMetadata.set(sigTokens.nftId, { name: "SUSD Bank V2 NFT" });

    const bob = chain.newParty("Bob").withBalance({
      nanoergs: 100000000000n,
      tokens: [{ tokenId: sigTokens.stableCoinId, amount: 100n }]
    });
    const bankParty = chain
      .newParty({ name: "SigmaUSD Bank", ergoTree: SIGMA_USD_PARAMETERS.contract })
      .withUTxOs(bank.bankBox);

    const transaction = new TransactionBuilder(height)
      .from(bob.utxos.toArray())
      .extend(
        AgeUSDExchangePlugin(bank, {
          redeem: "stable",
          amount: 10n,
          recipient: bob.address,
          fee: RECOMMENDED_MIN_FEE_VALUE
        })
      )
      .sendChangeTo(bob.address)
      .build();

    expect(chain.execute(transaction, { log: true })).to.be.true;
  });
});
