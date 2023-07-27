import { ErgoTree } from "@fleet-sdk/core";
import { ErgoTree as SigmaErgoTree, Value as SigmaValue } from "sigmastate-js/main";

export class CompilerOutput extends ErgoTree {
  private readonly _tree: SigmaErgoTree;

  constructor(tree: SigmaErgoTree) {
    super(Uint8Array.from(tree.bytes().u));
    this._tree = tree;
  }

  get template(): Uint8Array {
    return Uint8Array.from(this._tree.template().u);
  }

  get constants(): SigmaValue[] {
    return this._tree.constants();
  }
}
