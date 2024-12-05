import { ErgoTree, type Network } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import type { ErgoTree as SigmaErgoTree, Value as SigmaValue } from "sigmastate-js/main";
import { ContractTemplate } from "./contractTemplate";

export class CompilerOutput extends ErgoTree {
  readonly #tree: SigmaErgoTree;
  #template?: ContractTemplate;

  constructor(tree: SigmaErgoTree, network?: Network) {
    super(hex.decode(tree.toHex()), network);
    this.#tree = tree;
  }

  get template(): ContractTemplate {
    if (!this.#template) {
      const templateBytes = hex.decode(this.#tree.templateHex());
      this.#template = new ContractTemplate(templateBytes);
    }

    return this.#template;
  }

  get constants(): SigmaValue[] {
    return this.#tree.constants();
  }
}
