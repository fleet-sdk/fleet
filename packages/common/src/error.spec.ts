import { describe, expect, it } from "vitest";
import { BlockchainProviderError, FleetError, NotSupportedError } from "./error";

describe("Errors", () => {
  it("Should construct errors", () => {
    const errorMsg = "error smoke test";

    expect(new FleetError().name).to.be.equal("FleetError");
    expect(new NotSupportedError().name).to.be.equal("NotSupportedError");
    expect(new BlockchainProviderError().name).to.be.equal("BlockchainProviderError");

    expect(() => {
      throw new FleetError(errorMsg);
    }).to.throw(FleetError, errorMsg);

    expect(() => {
      throw new NotSupportedError(errorMsg);
    }).to.throw(NotSupportedError, errorMsg);
  });
});
