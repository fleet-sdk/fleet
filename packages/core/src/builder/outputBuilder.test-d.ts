import { SBool, SInt, SLong } from "@fleet-sdk/serializer";
import { describe, expectTypeOf, it } from "vitest";
import { OutputBuilder, SAFE_MIN_BOX_VALUE } from "./outputBuilder";

describe("Sequential registers types", () => {
  const builder = new OutputBuilder(SAFE_MIN_BOX_VALUE, "9am...");

  it("Should accept sequential inputs", () => {
    expectTypeOf(
      builder.setAdditionalRegisters({
        R4: SInt(1),
        R5: SBool(true).toHex()
      })
    ).toMatchTypeOf<OutputBuilder>();

    expectTypeOf(
      builder.setAdditionalRegisters({
        R4: SInt(1),
        R5: SBool(true).toHex(),
        R6: SLong(1n),
        R7: SBool(false),
        R8: SBool(true),
        R9: SInt(10).toHex()
      })
    ).toMatchTypeOf<OutputBuilder>();
  });

  it("Should not accept out-of-sequence inputs", () => {
    // @ts-expect-error should now accept undefined params
    builder.setAdditionalRegisters();
    // @ts-expect-error skipped R4
    builder.setAdditionalRegisters({ R5: SBool(true) });
    // @ts-expect-error skipped R6 and R7
    builder.setAdditionalRegisters({ R4: SBool(true), R5: SInt(2), R9: SBool(false) });
  });
});
