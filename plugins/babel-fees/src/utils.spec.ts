import { first } from "@fleet-sdk/common";
import { describe, expect, it } from "vitest";
import { babelBoxesMock } from "./tests/babelBoxesMock";
import { regularBoxesMock } from "./tests/regularBoxesMock";
import { babelContractTestVectors } from "./tests/testVectors";
import {
  buildBabelContract,
  extractTokenIdFromBabelContract,
  getTokenPrice,
  isBabelContractForTokenId,
  isValidBabelContract
} from "./utils";

describe("getTokenPrice()", () => {
  it("Should get the token rate for a box", () => {
    expect(getTokenPrice(first(babelBoxesMock))).toBe(4000000n);
  });

  it("Should fail with an invalid Babel Box", () => {
    for (const regularBox of regularBoxesMock) {
      expect(() => {
        getTokenPrice(regularBox);
      }).toThrow();
    }
  });
});

describe("buildBabelContract()", () => {
  it("Should build contract for tokenId", () => {
    for (const tv of babelContractTestVectors) {
      expect(buildBabelContract(tv.tokenId)).toBe(tv.ergoTree);
    }
  });

  it("Should fail an invalid tokenId", () => {
    expect(() => {
      buildBabelContract("invalid token id");
    }).toThrow();
  });
});

describe("isBabelContractForTokenId()", () => {
  it("Should validate with valid babel boxes", () => {
    for (const tv of babelContractTestVectors) {
      expect(isBabelContractForTokenId(tv.ergoTree, tv.tokenId)).toBeTruthy();
    }
  });

  it("Should fail with valid contract and token id, but not matching", () => {
    expect(
      isBabelContractForTokenId(
        "100604000e2003faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf040400040005000500d803d601e30004d602e4c6a70408d603e4c6a7050595e67201d804d604b2a5e4720100d605b2db63087204730000d606db6308a7d60799c1a7c17204d1968302019683050193c27204c2a7938c720501730193e4c672040408720293e4c672040505720393e4c67204060ec5a796830201929c998c7205029591b1720673028cb272067303000273047203720792720773057202",
        "beefc19f4224eec14d5cfb984b31bd691a4b20d1a7909e0e53fe4c9ea9b1b002"
      )
    ).toBeFalsy();
  });

  it("Should fail with invalid ergoTrees", () => {
    expect(
      isBabelContractForTokenId(
        "100604000e2013faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf040400040005000500d803d601e30004d602e4c6a70408d603e4c6a7050595e67201d804d604b2a5e4720100d605b2db63087204730000d606db6308a7d60799c1a7c17204d1968302019683050193c27204c2a7938c720501730193e4c672040408720293e4c672040505720393e4c67204060ec5a796830201929c998c7205029591b1720673028cb272067303000273047203720792720773057202",
        "beefc19f4224eec14d5cfb984b31bd691a4b20d1a7909e0e53fe4c9ea9b1b002"
      )
    ).toBeFalsy();
    expect(
      isBabelContractForTokenId(
        "100604000e203faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf040400040005000500d803d601e30004d602e4c6a70408d603e4c6a7050595e67201d804d604b2a5e4720100d605b2db63087204730000d606db6308a7d60799c1a7c17204d1968302019683050193c27204c2a7938c720501730193e4c672040408720293e4c672040505720393e4c67204060ec5a796830201929c998c7205029591b1720673028cb272067303000273047203720792720773057202",
        "beefc19f4224eec14d5cfb984b31bd691a4b20d1a7909e0e53fe4c9ea9b1b002"
      )
    ).toBeFalsy();
  });
});

describe("isBabelContract()", () => {
  it("Should validate with valid babel boxes", () => {
    for (const tv of babelContractTestVectors) {
      expect(isValidBabelContract(tv.ergoTree)).toBeTruthy();
    }
  });

  it("Should fail with valid contract and token id, but not matching", () => {
    expect(
      isValidBabelContract(
        "110604000e20472c3d4ecaa08fb7392ff041ee2e6af75f4a558810a74b28600549d5392810e80400040005000500d803d601e30004d602e4c6a70408d603e4c6a7050595e67201d804d604b2a5e4720100d605b2db63087204730000d606db6308a7d60799c1a7c17204d1968302019683050193c27204c2a7938c720501730193e4c672040408720293e4c672040505720393e4c67204060ec5a796830201929c998c7205029591b1720673028cb272067303000273047203720792720773057202"
      )
    ).toBeFalsy();
  });
});

describe("extractTokenIdFromBabelContract()", () => {
  it("Should extract for valid babel contracts", () => {
    for (const tv of babelContractTestVectors) {
      expect(extractTokenIdFromBabelContract(tv.ergoTree)).toBe(tv.tokenId);
    }
  });

  it("Should fail with invalid contracts", () => {
    expect(() => {
      extractTokenIdFromBabelContract(
        "101604000e2013faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf040400040005000500d803d601e30004d602e4c6a70408d603e4c6a7050595e67201d804d604b2a5e4720100d605b2db63087204730000d606db6308a7d60799c1a7c17204d1968302019683050193c27204c2a7938c720501730193e4c672040408720293e4c672040505720393e4c67204060ec5a796830201929c998c7205029591b1720673028cb272067303000273047203720792720773057202"
      );
    }).toThrow();

    expect(() => {
      extractTokenIdFromBabelContract("101604000e2");
    }).toThrow();

    expect(() => {
      extractTokenIdFromBabelContract("");
    }).toThrow();
  });
});
