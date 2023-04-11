import { describe, expect, it } from "vitest";
import { _0n, _10n, _127n, _128n, _1n, _63n, _7n } from "./bigIntLiterals";

describe("BigInt literals", () => {
  it("Should export BigInt literals", () => {
    expect(_0n).to.equal(0n);
    expect(_1n).to.equal(1n);
    expect(_7n).to.equal(7n);
    expect(_10n).to.equal(10n);
    expect(_63n).to.equal(63n);
    expect(_127n).to.equal(127n);
    expect(_128n).to.equal(128n);
  });
});
