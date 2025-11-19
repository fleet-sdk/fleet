import { describe, expect, it } from "vitest";
import {
  czech,
  english,
  french,
  italian,
  japanese,
  korean,
  portuguese,
  simplifiedChinese,
  spanish
} from "./wordlists";

describe("wordlists", () => {
  const wordlistLength = 2048;
  it("Should export all wordlists correctly", () => {
    expect(english).to.have.length(wordlistLength);
    expect(portuguese).to.have.length(wordlistLength);
    expect(simplifiedChinese).to.have.length(wordlistLength);
    expect(czech).to.have.length(wordlistLength);
    expect(french).to.have.length(wordlistLength);
    expect(italian).to.have.length(wordlistLength);
    expect(japanese).to.have.length(wordlistLength);
    expect(korean).to.have.length(wordlistLength);
    expect(spanish).to.have.length(wordlistLength);
  });
});
