import { NotAllowedTokenBurning } from "../errors";
import { regularBoxesMock } from "../tests/mocks/mockBoxes";
import { OutputBuilder } from "./outputBuilder";
import { createPluginContext, FleetPluginContext } from "./pluginContext";
import { TransactionBuilder } from "./transactionBuilder";

describe("Plugin context", () => {
  const creationHeight = 894169;
  let builder!: TransactionBuilder;
  let context!: FleetPluginContext;

  beforeEach(() => {
    builder = new TransactionBuilder(creationHeight);
    context = createPluginContext(builder);
  });

  it("Should add inputs", () => {
    const fromMethod = jest.spyOn(builder, "from");
    const configureSelectorMethod = jest.spyOn(builder, "configureSelector");

    const newLen = context.addInputs(regularBoxesMock);

    expect(fromMethod).toBeCalledTimes(1);
    expect(configureSelectorMethod).toBeCalledTimes(1);
    expect(builder.inputs).toHaveLength(newLen);
    expect(builder.inputs).toHaveLength(regularBoxesMock.length);
  });

  it("Should add a single input", () => {
    const fromMethod = jest.spyOn(builder, "from");
    const configureSelectorMethod = jest.spyOn(builder, "configureSelector");

    let newLen = context.addInputs(regularBoxesMock[0]);
    expect(fromMethod).toBeCalledTimes(1);
    expect(configureSelectorMethod).toBeCalledTimes(1);
    expect(builder.inputs).toHaveLength(newLen);
    expect(builder.inputs).toHaveLength(1);

    newLen = context.addInputs(regularBoxesMock[1]);
    expect(fromMethod).toBeCalledTimes(2);
    expect(configureSelectorMethod).toBeCalledTimes(2);
    expect(builder.inputs).toHaveLength(newLen);
    expect(builder.inputs).toHaveLength(2);
  });

  it("Should add data inputs", () => {
    const withDataFromMethod = jest.spyOn(builder, "withDataFrom");

    const newLen = context.addDataInputs(regularBoxesMock);

    expect(withDataFromMethod).toBeCalledTimes(1);
    expect(builder.dataInputs).toHaveLength(newLen);
    expect(builder.dataInputs).toHaveLength(regularBoxesMock.length);
  });

  it("Should add outputs", () => {
    const toMethod = jest.spyOn(builder, "to");

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
    const burnTokensMethod = jest.spyOn(builder, "burnTokens");

    builder
      .from(regularBoxesMock)
      .configure((settings) => settings.allowTokenBurningFromPlugins(true));

    context.burnTokens([
      { tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2", amount: 1n },
      { tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283", amount: 126n }
    ]);

    expect(burnTokensMethod).toBeCalledTimes(1);
    expect(builder.burning).toHaveLength(2);
  });

  it("Should burn tokens, globally allowed", () => {
    const burnTokensMethod = jest.spyOn(builder, "burnTokens");

    builder.from(regularBoxesMock).configure((settings) => settings.allowTokenBurning(true));

    context.burnTokens([
      { tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2", amount: 1n },
      { tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283", amount: 126n }
    ]);

    expect(burnTokensMethod).toBeCalledTimes(1);
    expect(builder.burning).toHaveLength(2);
  });

  it("Should fail if token burning is not allowed", () => {
    const burnTokensMethod = jest.spyOn(builder, "burnTokens");

    builder.from(regularBoxesMock);

    expect(() => {
      context.burnTokens([
        { tokenId: "bf2afb01fde7e373e22f24032434a7b883913bd87a23b62ee8b43eba53c9f6c2", amount: 1n },
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 126n
        }
      ]);
    }).toThrow(NotAllowedTokenBurning);

    expect(burnTokensMethod).not.toBeCalled();
    expect(builder.burning).toBeUndefined();
  });
});
