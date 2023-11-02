import { describe, expect, it } from "vitest";
import { ALL_BOX_QUERY, CONF_BOX_QUERY } from "./queries";

describe("Box queries", () => {
  it("Should build confirmed box query", () => {
    expect(CONF_BOX_QUERY).to.be.equal(
      `query boxes($spent: Boolean! $boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int) { boxes(spent: $spent boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } }`
    );
  });

  it("Should build confirmed + unconfirmed box query", () => {
    expect(ALL_BOX_QUERY).to.be.equal(
      `query boxes($spent: Boolean! $boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int) { boxes(spent: $spent boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } mempool { boxes(boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take) { boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent } } }`
    );
  });
});
