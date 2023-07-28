import { hexToBytes } from "@fleet-sdk/common";
import { ErgoTree } from "@fleet-sdk/core";
import { ErgoTree as SigmaErgoTree, Value as SigmaValue } from "sigmastate-js/main";
import { ContractTemplate } from "./contractTemplate";

export class CompilerOutput extends ErgoTree {
  private readonly _tree: SigmaErgoTree;
  private _template?: ContractTemplate;

  constructor(tree: SigmaErgoTree) {
    super(hexToBytes(tree.toHex()));
    this._tree = tree;
  }

  get template(): ContractTemplate {
    if (!this._template) {
      const templateBytes = hexToBytes(this._tree.templateHex());
      this._template = new ContractTemplate(templateBytes);
    }

    return this._template;
  }

  get constants(): SigmaValue[] {
    return this._tree.constants();
  }
}
