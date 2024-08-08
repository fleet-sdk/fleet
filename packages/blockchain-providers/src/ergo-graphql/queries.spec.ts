import { describe, expect, it } from "vitest";
import {
  ALL_BOXES_QUERY,
  CONF_BOXES_QUERY,
  CONF_TX_QUERY,
  UNCONF_BOXES_QUERY,
  UNCONF_TX_QUERY
} from "./queries";

describe("Box queries", () => {
  it("Should build confirmed box query", () => {
    expect(CONF_BOXES_QUERY).to.be.equal(
      "query boxes($spent: Boolean! $boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int) { boxes(spent: $spent boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } }"
    );
  });

  it("Should build confirmed + unconfirmed box query", () => {
    expect(ALL_BOXES_QUERY).to.be.equal(
      "query boxes($spent: Boolean! $boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int) { boxes(spent: $spent boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } mempool { boxes(boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } } }"
    );
  });

  it("Should build unconfirmed box query", () => {
    expect(UNCONF_BOXES_QUERY).to.be.equal(
      "query boxes($boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int) { mempool { boxes(boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } } }"
    );
  });

  it("Should build query for unconfirmed transactions", () => {
    expect(UNCONF_TX_QUERY).to.be.equal(
      "query unconfirmedTransactions($addresses: [String!], $transactionIds: [String!], $skip: Int, $take: Int) { mempool { transactions(addresses: $addresses, transactionIds: $transactionIds, skip: $skip, take: $take) { transactionId timestamp inputs { proofBytes extension index box { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters } } dataInputs { boxId } outputs { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters } } } }"
    );
  });

  it("Should build query for confirmed transactions", () => {
    expect(CONF_TX_QUERY).to.be.equal(
      "query confirmedTransactions($addresses: [String!], $transactionIds: [String!], $skip: Int, $take: Int  $relevantOnly: Boolean) { transactions(addresses: $addresses, transactionIds: $transactionIds, skip: $skip, take: $take) { transactionId timestamp inputs { proofBytes extension index box { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters } } dataInputs { boxId } outputs(relevantOnly: $relevantOnly) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters } inclusionHeight headerId index } }"
    );
  });
});
