import { SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import pc from "picocolors";
import { describe, expect, it, vi } from "vitest";
import {
  between,
  center,
  compact,
  left,
  line,
  printDiff,
  right,
  stringifyBalance
} from "./balancePrinting";
import { MockChain } from "./mockChain";

describe("Stringify balance", () => {
  const chain = new MockChain();

  it("Should create string with erg and tokens", () => {
    const party = chain.newParty("bob").withBalance({
      nanoergs: SAFE_MIN_BOX_VALUE,
      tokens: [
        {
          tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
          amount: 150n
        },
        {
          tokenId: "36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1",
          amount: 45687n
        },
        {
          tokenId: "003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0",
          amount: 4561231232387n
        }
      ]
    });

    expect(stringifyBalance(party.balance, party.name, 60)).to.be.equal(
      `
------------------------------------------------------------
                          - bob -                           
------------------------------------------------------------
Asset                                                Balance
============================================================
nanoerg                                              1000000
03faf2cb329f2e90d6d...21f52fbe2824bfcbf04                150
36aba4b4a97b65be491...0ec8330d1e8946161c1              45687
003bd19d0187117f130...43c5c4dd158949285d0      4561231232387
------------------------------------------------------------`.slice(1)
    );
  });

  it("Diff printing", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => {
      return;
    });

    const party = chain.newParty("alice");
    const oldBalance = stringifyBalance(party.balance, party.name, 30);

    party.addBalance({ nanoergs: SAFE_MIN_BOX_VALUE });

    const newBalance = stringifyBalance(party.balance, party.name, 30);

    printDiff(oldBalance, newBalance);

    const gry = pc.gray;
    const red = pc.red;
    const grn = pc.green;
    const output = [
      gry("  ------------------------------"),
      gry("            - alice -           "),
      gry("  ------------------------------"),
      gry("  Asset                  Balance"),
      gry("  =============================="),
      red("- nanoerg                      0"),
      grn("+ nanoerg                1000000"),
      gry("  ------------------------------")
    ];

    for (let i = 0; i < output.length; i++) {
      expect(consoleMock.mock.calls[i][0]).to.be.equal(output[i]);
    }
  });
});

describe("String formatting functions", () => {
  it("Should compact", () => {
    const str = "9i3g6d958MpZAqWn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin";

    expect(compact(str, 10)).to.be.equal("9i3...hin");
    expect(compact(str, 20)).to.be.equal("9i3g6d95...koqnahin");
    expect(compact(str, 100)).to.be.equal(str);
    expect(compact(str, 0)).to.be.equal("");
    expect(compact(str, 2)).to.be.equal("9i");
    expect(compact(str, 5)).to.be.equal("9i3g6");
    expect(compact(str, 6)).to.be.equal("9...n");
  });

  it("Should centralize", () => {
    const str = "test";

    let aligned = center(str, 10);
    expect(aligned).to.have.length(10);
    expect(aligned).to.be.equal("   test   ");

    aligned = center(str, 11);
    expect(aligned).to.have.length(11);
    expect(aligned).to.be.equal("   test    ");

    aligned = center(str, 3);
    expect(aligned).to.have.length(4);
    expect(aligned).to.be.equal("test");
  });

  it("Should align left", () => {
    const str = "test";

    let aligned = left(str, 10);
    expect(aligned).to.have.length(10);
    expect(aligned).to.be.equal("test      ");

    aligned = left(str, 11);
    expect(aligned).to.have.length(11);
    expect(aligned).to.be.equal("test       ");

    aligned = left(str, 3);
    expect(aligned).to.have.length(4);
    expect(aligned).to.be.equal("test");
  });

  it("Should align right", () => {
    const str = "test";

    let aligned = right(str, 10);
    expect(aligned).to.have.length(10);
    expect(aligned).to.be.equal("      test");

    aligned = right(str, 11);
    expect(aligned).to.have.length(11);
    expect(aligned).to.be.equal("       test");

    aligned = right(str, 3);
    expect(aligned).to.have.length(4);
    expect(aligned).to.be.equal("test");
  });

  it("Should justify between", () => {
    const tokenId = "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b";
    const balance = "4243243433";

    let justified = between(tokenId, balance, 20);
    expect(justified).to.have.length(20);
    expect(justified).to.be.equal("0cd...24b 4243243433");

    justified = between(tokenId, balance, 25);
    expect(justified).to.have.length(25);
    expect(justified).to.be.equal("0cd8c...3324b  4243243433");

    justified = between(tokenId, balance, 80);
    expect(justified).to.have.length(80);
    expect(justified).to.be.equal(
      "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b      4243243433"
    );

    justified = between(tokenId, "12938749128379837", 80);
    expect(justified).to.have.length(80);
    expect(justified).to.be.equal(
      "0cd8c9f416e5b1ca9f986a7f10a84...85941619e49e53c0dc30ebf83324b  12938749128379837"
    );

    justified = between(tokenId, "12938749128379837", 20);
    expect(justified).to.have.length(20);
    expect(justified).to.be.equal("0c 12938749128379837");

    justified = between(tokenId, balance, 60, 40);
    expect(justified).to.have.length(60);
    expect(justified).to.be.equal("0cd8c9f416e5b1ca9f...e53c0dc30ebf83324b           4243243433");

    justified = between(tokenId, balance, 15, 10);
    expect(justified).to.have.length(15);
    expect(justified).to.be.equal("0cd8 4243243433");
  });

  it("Should draw a line", () => {
    expect(line("-", 10)).to.be.equal("----------");
    expect(line("~", 10)).to.be.equal("~~~~~~~~~~");
    expect(line("ab", 10)).to.be.equal("ababababab");
  });
});
