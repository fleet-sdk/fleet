import { describe, expect, it } from "vitest";
import { keyAddressesTestVectors } from "./_test-vectors/keyVectors";
import { generateMnemonic, validateMnemonic } from "./mnemonic";

describe("Mnemonic generation", () => {
  it("Should create a valid 12 word mnemonic", () => {
    const mnemonic = generateMnemonic(128);

    expect(mnemonic.split(" ")).to.have.length(12);
    expect(validateMnemonic(mnemonic)).to.be.true;
  });

  it("Should create a valid 15 word mnemonic by default", () => {
    const mnemonic = generateMnemonic();

    expect(mnemonic.split(" ")).to.have.length(15);
    expect(validateMnemonic(mnemonic)).to.be.true;
  });

  it("Should create a valid 24 word mnemonic", () => {
    const mnemonic = generateMnemonic(256);

    expect(mnemonic.split(" ")).to.have.length(24);
    expect(validateMnemonic(mnemonic)).to.be.true;
  });
});

describe("Mnemonic validation", () => {
  it("Should pass for valid mnemonics", () => {
    for (const tv of keyAddressesTestVectors) {
      expect(validateMnemonic(tv.mnemonic)).to.be.true;
    }
  });

  it("Should not pass for invalid mnemonics", () => {
    expect(validateMnemonic("")).to.be.false;
    expect(
      validateMnemonic(
        "brown reason sponsor fix defense pair kit private front next drip fire clip student"
      )
    ).to.be.false;

    expect(
      validateMnemonic(
        "brown acid reason sponsor fix defense pair kit private front next drip clip fire student"
      )
    ).to.be.false;
  });
});
