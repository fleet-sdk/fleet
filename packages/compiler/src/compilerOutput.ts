import { ErgoTree } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import {
  ErgoTree as SigmaErgoTree,
  Value as SigmaValue
} from "sigmastate-js/main";
import { ContractTemplate } from "./contractTemplate";

export class CompilerOutput extends ErgoTree {
  private readonly _tree: SigmaErgoTree;
  private _template?: ContractTemplate;

  constructor(tree: SigmaErgoTree) {
    super(hex.decode(tree.toHex()));
    this._tree = tree;
  }

  get template(): ContractTemplate {
    if (!this._template) {
      const templateBytes = hex.decode(this._tree.templateHex());
      this._template = new ContractTemplate(templateBytes);
    }

    return this._template;
  }

  get constants(): SigmaValue[] {
    return this._tree.constants();
  }
}
