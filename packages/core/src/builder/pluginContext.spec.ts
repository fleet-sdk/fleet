import { regularBoxes } from "_test-vectors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotAllowedTokenBurning } from "../errors";
import { OutputBuilder } from "./outputBuilder";
import { createPluginContext, type FleetPluginContext } from "./pluginContext";
import { RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from "./transactionBuilder";

describe("Plugin context", () => {
  const creationHeight = 894169;
  let builder!: TransactionBuilder;
  let context!: FleetPluginContext;

  beforeEach(() => {
    builder = new TransactionBuilder(creationHeight);
    context = createPluginContext(builder);
  });

  it("Should add inputs", () => {
    const fromSpy = vi.spyOn(builder, "from");
    const newLen = context.addInputs(regularBoxes);

    expect(fromSpy).toBeCalledTimes(1);
    expect(fromSpy).toBeCalledWith(regularBoxes, { ensureInclusion: true });
    expect(builder.inputs).toHaveLength(newLen);
    expect(builder.inputs).toHaveLength(regularBoxes.length);
  });

  it("Should add a single input", () => {
    const fromSpy = vi.spyOn(builder, "from");

    const inputs = regularBoxes[0];
    let newLen = context.addInputs(regularBoxes[0]);
    expect(fromSpy).toBeCalledTimes(1);
    expect(fromSpy).toBeCalledWith(inputs, { ensureInclusion: true });
    expect(builder.inputs).toHaveLength(newLen);
    expect(builder.inputs).toHaveLength(1);

    newLen = context.addInputs(regularBoxes[1]);
    expect(fromSpy).toBeCalledTimes(2);
    expect(builder.inputs).toHaveLength(newLen);
    expect(builder.inputs).toHaveLength(2);
  });

  it("Should add data inputs", () => {
    const withDataFromMethod = vi.spyOn(builder, "withDataFrom");

    const newLen = context.addDataInputs(regularBoxes);

    expect(withDataFromMethod).toBeCalledTimes(1);
    expect(builder.dataInputs).toHaveLength(newLen);
    expect(builder.dataInputs).toHaveLength(regularBoxes.length);
  });

  it("Should add outputs", () => {
    const toMethod = vi.spyOn(builder, "to");

    let newLen = context.addOutputs(
      new OutputBuilder(10000n, "9gn5Jo6T7m4pAzCdD9JFdRMPxnfKLPgcX68rD8RQvPLyJsTpKcq")
    );

    expect(toMethod).toBeCalledTimes(1);
    expect(newLen).toBe(builder.outputs.length);

    newLen = context.addOutputs(
      new OutputBuilder(20000n, "9gn5Jo6T7m4pAzCdD9JFdRMPxnfKLPgcX68rD8RQvPLyJsTpKcq")
    );

    expect(toMethod).toBeCalledTimes(2);
    expect(builder.outputs).toHaveLength(newLen);
    expect(builder.outputs).toHaveLength(2);
  });

  it("Should burn tokens, plugin context allowed", () => {
    const burnTokensMethod = vi.spyOn(builder, "burnTokens");

    builder
      .from(regularBoxes)
      .configure((settings) => settings.allowTokenBurningFromPlugins(true));

    context.burnTokens([
      {
        tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2",
        amount: 1n
      },
      {
        tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
        amount: 126n
      }
    ]);

    expect(burnTokensMethod).toBeCalledTimes(1);
    expect(builder.burning).toHaveLength(2);
  });

  it("Should burn tokens, globally allowed", () => {
    const burnTokensMethod = vi.spyOn(builder, "burnTokens");

    builder.from(regularBoxes).configure((settings) => settings.allowTokenBurning(true));

    context.burnTokens([
      {
        tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2",
        amount: 1n
      },
      {
        tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
        amount: 126n
      }
    ]);

    expect(burnTokensMethod).toBeCalledTimes(1);
    expect(builder.burning).toHaveLength(2);
  });

  it("Should fail if token burning is not allowed", () => {
    const burnTokensMethod = vi.spyOn(builder, "burnTokens");

    builder.from(regularBoxes);

    expect(() => {
      context.burnTokens([
        {
          tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2",
          amount: 1n
        },
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 126n
        }
      ]);
    }).toThrow(NotAllowedTokenBurning);

    expect(burnTokensMethod).not.toBeCalled();
    expect(builder.burning).toBeUndefined();
  });

  it("Should set fee amount", () => {
    builder.from(regularBoxes);

    const payFeeMethod = vi.spyOn(builder, "payFee");
    const fee = RECOMMENDED_MIN_FEE_VALUE * 3n;

    context.setFee(RECOMMENDED_MIN_FEE_VALUE * 3n);

    expect(builder.fee).to.be.equal(fee);
    expect(payFeeMethod).toBeCalledWith(fee);
  });
});
