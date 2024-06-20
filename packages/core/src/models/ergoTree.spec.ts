import { hex } from "@fleet-sdk/crypto";
import { describe, expect, it, test } from "vitest";
import { ErgoTree } from "./ergoTree";

describe("ErgoTree model", () => {
  test.each([
    {
      tree: "100104c801d191a37300",
      version: 0,
      size: false,
      segregatedConstants: true
    },
    {
      tree: "00d191a304c801",
      version: 0,
      size: false,
      segregatedConstants: false
    },
    {
      tree: "0806d191a304c801",
      version: 0,
      size: true,
      segregatedConstants: false
    },
    {
      tree: "18090104c801d191a37300",
      version: 0,
      size: true,
      segregatedConstants: true
    },
    {
      tree: "19090104c801d191a37300",
      version: 1,
      size: true,
      segregatedConstants: true
    }
  ])("Should construct from hex ($tree)", (tv) => {
    const tree = new ErgoTree(tv.tree);

    expect(tree.toHex()).to.be.equal(tv.tree);
    expect(tree.header).to.be.equal(
      Number.parseInt(tv.tree.substring(0, 2), 16)
    );
    expect(tree.version).to.be.equal(tv.version);
    expect(tree.hasSize).to.be.equal(tv.size);
    expect(tree.hasSegregatedConstants).to.be.equal(tv.segregatedConstants);
  });

  it("Should construct from bytes", () => {
    const treeHex = "100104c801d191a37300";
    const tree = new ErgoTree(hex.decode(treeHex));
    expect(tree.toHex()).to.be.equal(treeHex);
  });

  it("Should create ErgoAddress instance", () => {
    const treeHex = "100104c801d191a37300";
    const tree = new ErgoTree(treeHex);
    expect(tree.toAddress().ergoTree).to.be.equal(treeHex);
  });
});
