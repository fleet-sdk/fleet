import { Network } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { ErgoTree$ } from "sigmastate-js/main";
import { describe, expect, it, test } from "vitest";
import { SInt } from "../constantSerializer";
import { ErgoAddress } from "./ergoAddress";
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
    expect(tree.header).to.be.equal(Number.parseInt(tv.tree.substring(0, 2), 16));
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

describe("Constant handling", () => {
  it("Should parse constants", () => {
    const treeHex = "18090104c801d191a37300";

    const tree = new ErgoTree(treeHex);
    expect(tree.constants).not.to.be.undefined;
    expect(tree.constants).to.have.length(1);
    expect(tree.constants?.[0].data).to.be.equal(100);

    const sigmaJsTree = ErgoTree$.fromHex(treeHex);
    expect(sigmaJsTree.constants()).not.to.be.undefined;
    expect(sigmaJsTree.constants()).to.have.length(1);
    expect(sigmaJsTree.constants()[0].data).to.be.equal(100);

    // todo: move to template generation specific test
    expect(sigmaJsTree.templateHex()).to.be.equal(hex.encode(tree.template));
  });

  it("should replace constant", () => {
    const originalTreeHex = "100104c801d191a37300"; // sigmaProp(HEIGHT > 100)
    const originalTree = new ErgoTree(originalTreeHex);

    expect(originalTree.constants).to.have.length(1);
    expect(originalTree.constants?.[0].data).to.be.equal(100);

    originalTree.replaceConstant(0, SInt(200));
    expect(originalTree.constants?.[0].data).to.be.equal(200);

    const patchedTreeHex = originalTree.toHex();
    const patchedTree = new ErgoTree(patchedTreeHex);
    expect(originalTree.template).to.be.deep.equal(patchedTree.template);
    expect(patchedTree.constants).to.have.length(1);
    expect(patchedTree.constants?.[0].data).to.be.equal(200);
  });
});

describe("Encoding", () => {
  const treeHex = "100104c801d191a37300";

  it("Should default to mainnet", () => {
    const tree = new ErgoTree(treeHex);
    expect(tree.toAddress().network).to.be.equal(Network.Mainnet);
  });

  it("Should override encoding network from constructor params", () => {
    const mainnetTree = new ErgoTree(treeHex, Network.Mainnet);
    expect(mainnetTree.toAddress().network).to.be.equal(Network.Mainnet);

    const testnetTree = new ErgoTree(treeHex, Network.Testnet);
    expect(testnetTree.toAddress().network).to.be.equal(Network.Testnet);
  });

  it("Should explicitly encode for testnet", () => {
    const tree = new ErgoTree(treeHex);
    expect(tree.toAddress(Network.Testnet).network).to.be.equal(Network.Testnet);
  });

  it("Should explicitly encode for mainnet", () => {
    const tree = new ErgoTree(treeHex);
    expect(tree.toAddress(Network.Mainnet).network).to.be.equal(Network.Mainnet);
  });

  it("Should explicitly encode for a network despite of constructor params", () => {
    const tree1 = new ErgoTree(treeHex, Network.Mainnet);
    expect(tree1.toAddress(Network.Testnet).network).to.be.equal(Network.Testnet);

    const tree2 = new ErgoTree(treeHex, Network.Testnet);
    expect(tree2.toAddress(Network.Mainnet).network).to.be.equal(Network.Mainnet);
  });

  it("Should encode to Base58 string", () => {
    // should default to mainnet
    expect(ErgoAddress.decode(new ErgoTree(treeHex).encode()).network).to.be.equal(Network.Mainnet);

    // should encode for testnet
    expect(ErgoAddress.decode(new ErgoTree(treeHex).encode(Network.Testnet)).network).to.be.equal(
      Network.Testnet
    );

    // should override encoding network from constructor params
    expect(ErgoAddress.decode(new ErgoTree(treeHex, Network.Testnet).encode()).network).to.be.equal(
      Network.Testnet
    );
  });
});
