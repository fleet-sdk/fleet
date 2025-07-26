import { Network } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { SBool, SLong, SigmaByteReader, estimateVLQSize } from "@fleet-sdk/serializer";
import { ErgoTree$ } from "sigmastate-js/main";
import { describe, expect, it, test } from "vitest";
import { SInt } from "../constantSerializer";
import { ErgoAddress } from "./ergoAddress";
import { ErgoTree, type JsonCompilerOutput } from "./ergoTree";

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
    expect(tree.constants).not.to.be.empty;
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

  it("Should replace constant with a bigger one", () => {
    const originalTreeHex = "18090104c801d191a37300"; // sigmaProp(HEIGHT > 100), 100 needs 1 byte
    const originalTree = new ErgoTree(originalTreeHex);
    expect(originalTree.hasSize).to.be.true;
    expect(originalTree.constants).to.have.length(1);
    expect(originalTree.constants?.[0].data).to.be.equal(100);

    let reader = new SigmaByteReader(originalTreeHex);
    reader.readByte(); // skip header
    let size = reader.readUInt();
    const originalTreeSize = 1 + estimateVLQSize(size) + size; // header + vlq size + body
    expect(originalTree.bytes.length).to.be.equal(originalTreeSize); // header + vlq size + body

    originalTree.replaceConstant(0, SInt(20000)); // 20000 needs 3 bytes
    expect(originalTree.constants?.[0].data).to.be.equal(20000);

    const patchedTreeHex = originalTree.toHex();
    const patchedTree = new ErgoTree(patchedTreeHex);
    expect(originalTree.template).to.be.deep.equal(patchedTree.template);
    expect(patchedTree.constants).to.have.length(1);
    expect(patchedTree.constants?.[0].data).to.be.equal(20000);

    // check if the size is updated
    reader = new SigmaByteReader(patchedTreeHex);
    reader.readByte(); // skip header
    size = reader.readUInt();
    const patchedTreeSize = 1 + estimateVLQSize(size) + size; // header + vlq size + body
    expect(patchedTree.bytes.length).to.be.equal(patchedTreeSize); // header + vlq size + body
    expect(patchedTreeSize).to.be.greaterThan(
      originalTreeSize,
      "original tree size should be smaller"
    );
  });

  it("Should replace constant and preserve others", () => {
    const tree = new ErgoTree("100204c801049003d1ed91a373008fa37301"); // sigmaProp(HEIGHT > 100 && HEIGHT < 200)
    expect(tree.hasSegregatedConstants).to.be.true;
    expect(tree.constants).to.have.length(2);
    expect(tree.constants?.[0].data).to.be.equal(100);
    expect(tree.constants?.[1].data).to.be.equal(200);

    tree.replaceConstant(0, SInt(300));

    expect(tree.constants).to.have.length(2);
    expect(tree.constants?.[0].data).to.be.equal(300);
    expect(tree.constants?.[1].data).to.be.equal(200);

    const reconstructedTree = new ErgoTree(tree.bytes);
    expect(reconstructedTree.constants).to.have.length(2);
    expect(reconstructedTree.constants?.[0].data).to.be.equal(300);
    expect(reconstructedTree.constants?.[0].type.toString()).to.be.equal("SInt");
    expect(reconstructedTree.constants?.[1].data).to.be.equal(200);
    expect(reconstructedTree.constants?.[1].type.toString()).to.be.equal("SInt");
  });

  it("should fail to replace constant in a non-segregated tree", () => {
    const tree = new ErgoTree("00d191a304c801");
    expect(tree.hasSegregatedConstants).to.be.false;
    expect(() => tree.replaceConstant(0, SInt(200))).to.throw(
      "Constant segregation is not enabled."
    );
  });

  it("should fail to replace constant of different type", () => {
    const tree = new ErgoTree("18090104c801d191a37300"); // sigmaProp(HEIGHT > 100)
    expect(tree.hasSegregatedConstants).to.be.true;
    expect(tree.constants).to.have.length(1);
    expect(() => tree.replaceConstant(0, SBool(true))).to.throw(
      "Constant type mismatch: can't replace 'SInt' with 'SBool'"
    );
  });

  it("should fail to replace non-existing constant", () => {
    const tree = new ErgoTree("18090104c801d191a37300"); // sigmaProp(HEIGHT > 100)
    expect(tree.hasSegregatedConstants).to.be.true;
    expect(tree.constants).to.have.length(1);
    expect(() => tree.replaceConstant(1, SInt(200))).to.throw("Constant at index 1 not found.");
  });
});

describe("Serialization", () => {
  it("Should parse and reconstruct tree with segregated constants", () => {
    const treeHex = "18090104c801d191a37300"; // sigmaProp(HEIGHT > 100)
    const tree = new ErgoTree(treeHex);
    expect(tree.hasSegregatedConstants).to.be.true;
    expect(tree.constants).not.to.be.empty; // checking constants triggers parsing
    expect(tree.constants).to.have.length(1);
    expect(tree.constants?.[0].data).to.be.equal(100);
    expect(tree.toHex()).to.be.equal(treeHex); // check if the tree is reconstructed correctly
  });

  it("should parse and reconstruct tree with non-segregated consts", () => {
    const treeHex = "00d191a304c801"; // sigmaProp(HEIGHT > 100)
    const tree = new ErgoTree(treeHex);
    expect(tree.hasSegregatedConstants).to.be.false;
    expect(tree.constants).to.be.empty; // checking constants don't trigger parsing if `hasSegregatedConstants == false`
    expect(tree.template).not.to.be.empty; // checking template triggers parsing
    expect(tree.toHex()).to.be.equal(treeHex); // check if the tree is reconstructed correctly
  });

  it("Should parse and reconstruct tree with segregated constants, but no constants", () => {
    const treeHex = "1000d17300"; // sigmaProp(false), manually tweaked to have empty constants
    const tree = new ErgoTree(treeHex);
    expect(tree.hasSegregatedConstants).to.be.true;
    expect(tree.constants).to.be.empty;
    expect(tree.toHex()).to.be.equal(treeHex); // check if the tree is reconstructed correctly
  });

  it("should fail to parse empty root tree", () => {
    const tree = new ErgoTree("00");
    expect(tree.hasSegregatedConstants).to.be.false;
    expect(() => tree.template /* triggers parsing */).to.throw("Empty tree bytes.");
  });

  it("Should ignore pushing new constants to a tree", () => {
    const treeHex = "18090104c801d191a37300"; // sigmaProp(HEIGHT > 100)
    const tree = new ErgoTree(treeHex);
    expect(tree.hasSegregatedConstants).to.be.true;
    expect(tree.constants).to.have.length(1);

    // @ts-expect-error constants prop is readonly
    tree.constants.push(SInt(200));

    expect(tree.constants).to.have.length(1); // should not change the length
    expect(tree.toHex()).to.be.equal(treeHex); // check if the tree is reconstructed correctly
  });
});

describe("Template generation", () => {
  it("should ignore direct template changes", () => {
    const treeHex = "18090104c801d191a37300"; // sigmaProp(HEIGHT > 100)
    const tree = new ErgoTree(treeHex);

    // @ts-expect-error template prop is readonly
    tree.template[0] = 0xff; // change first byte to 0xff

    expect(tree.template[0]).not.to.be.equal(0xff); // check if the template is changed

    tree.replaceConstant(0, SInt(100)); // trigger re-serializations and should not change the template

    expect(tree.toHex()).to.be.equal(treeHex); // check if the tree is reconstructed correctly
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

describe("JSON object construction", () => {
  const testVectors: {
    name: string;
    tree: string;
    compilerOutput: JsonCompilerOutput;
  }[] = [
    {
      name: "ErgoTree with segregated constants",
      tree: "1a740a04c80104900304d8040e20fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e400e106b75d7c82b1c99619f2c6ea6d6585cc904ca01040201000490030404d801d601830304730073017302d1ededed9373037304917305b272017306007307917308b27201730900",
      compilerOutput: {
        header: "1a",
        expressionTree:
          "d801d601830304730073017302d1ededed9373037304917305b272017306007307917308b27201730900",
        constants: [
          { value: "04c801", type: "Int" },
          { value: "049003", type: "Int", name: "_deadline_two" },
          { value: "04d804", type: "Int" },
          {
            value: "0e20fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40",
            type: "Coll[Byte]"
          },
          {
            value: "0e106b75d7c82b1c99619f2c6ea6d6585cc9",
            type: "Coll[Byte]",
            name: "$tokenId",
            description: "payment token id"
          },
          { value: "04ca01", type: "Int", name: "_deadline", description: "Payment deadline" },
          { value: "0402", type: "Int" },
          { value: "0100", type: "Bool" },
          { value: "049003", type: "Int", name: "_deadline_two" },
          { value: "0404", type: "Int" }
        ]
      }
    },
    {
      name: "Without size flag",
      tree: "10020580897a0402d19173007e730105",
      compilerOutput: {
        header: "10",
        expressionTree: "d19173007e730105",
        constants: [
          { value: "0580897a", type: "Long" },
          { value: "0402", type: "Int" }
        ]
      }
    },
    {
      name: "No constants segregation",
      tree: "0a08d1910580897a0402",
      compilerOutput: {
        header: "0a",
        expressionTree: "d1910580897a0402"
      }
    }
  ];

  test.each(testVectors)("Should construct from JSON object ($name)", (tv) => {
    const tree = ErgoTree.from(tv.compilerOutput);
    expect(tree.toHex()).to.be.equal(tv.tree);
  });

  it("Should support named constants", () => {
    const tv = {
      tree: "1a17030580897a0400059003d191b283010573007301007302",
      compilerOutput: {
        header: "1a",
        expressionTree: "d191b283010573007301007302",
        constants: [
          { value: "0580897a", type: "Long" },
          { value: "0400", type: "Int" },
          { value: "059003", type: "Long", name: "price2" }
        ]
      }
    };

    const tree = ErgoTree.from(tv.compilerOutput);
    expect(tree.toHex()).to.be.equal(tv.tree); // no changes made

    // should replace named constant
    tree.replaceConstant("price2", SLong(2n));
    expect(tree.constants[2].data).to.be.equal(2n);
    expect(tree.toHex()).not.to.be.equal(tv.tree);

    // replacing by number should work too
    expect(() => tree.replaceConstant(0, SLong(3n))).not.to.throw();

    // should throw if named constant is not found
    expect(() => tree.replaceConstant("non-existing", SLong(2n))).to.throw(
      "Constant with name 'non-existing' not found."
    );
  });
});
