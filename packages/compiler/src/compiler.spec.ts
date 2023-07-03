import { describe, expect, it } from "vitest";
import { compile } from "./compiler";

describe("Compiler", () => {
  const segregatedTree = "100104c801d191a37300";
  const embeddedTree = "00d191a304c801";

  it("Should compile", () => {
    const segregatedTree = compile("sigmaProp(HEIGHT > 100)").toHex();
    expect(segregatedTree).to.be.equal(segregatedTree);

    const nonSegregatedTree = compile("sigmaProp(HEIGHT > 100)", { segregateConstants: false });
    expect(nonSegregatedTree.toHex()).to.be.equal(embeddedTree);
  });

  it("Should compile with named constants", () => {
    const tree = compile("sigmaProp(HEIGHT > deadline)", { map: { deadline: 100 } });
    expect(tree.toHex()).to.be.equal(segregatedTree);
  });
});

function bench(name: string, callback: () => void, executions = 1) {
  let id = name;
  for (let i = 0; i < executions; i++) {
    if (executions > 1) {
      id = `${name}_${i}`;
    }

    // eslint-disable-next-line no-console
    console.time(id);

    callback();

    // eslint-disable-next-line no-console
    console.timeEnd(id);
  }
}

function keysOf(obj: object) {
  if (typeof obj !== "object") {
    return [Object.prototype.toString.call(obj)];
  }

  return [
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(obj)),
    ...Object.getOwnPropertyNames(obj)
  ]
    .filter((key) => key && "constructor" !== key)
    .map((key): string => {
      const prop = obj[key as keyof object] as object;
      const type = typeof prop;
      let typeStr = String(type);

      if (type === "function") {
        // eslint-disable-next-line @typescript-eslint/ban-types
        typeStr += `(${[...Array((prop as Function).length)]
          .map((v, i) => `arg_${i}`)
          .join(", ")})`;
      } else if (type === "object") {
        if (ArrayBuffer.isView(prop)) {
          typeStr = String(Object.prototype.toString.call(prop))
            .replace("[object ", "")
            .replace("]", "");
        } else if (Array.isArray(prop)) {
          typeStr = "[]";
        } else {
          typeStr = `{ ${keysOf(prop).join(", ")} }`;
        }
      }

      return `${key}: ${typeStr}`;
    });
}
