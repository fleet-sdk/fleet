import { manyTokensBoxesMock, regularBoxesMock } from "../mocks/mockBoxes";
import { ErgoAddress, MAX_TOKENS_PER_BOX } from "../models";
import { Network } from "../types";
import { first, some } from "../utils/arrayUtils";
import { sumBy, toBigInt } from "../utils/bigIntUtils";
import { OutputBuilder, SAFE_MIN_BOX_VALUE } from "./outputBuilder";
import { FEE_CONTRACT, RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from "./transactionBuilder";

const height = 844540;
const a1 = {
  address: "9hXBB1FS1UT5kiopced1LYXgPDoFgoFQsGnqPCbRaLZZ1YbJJHD",
  ergoTree: "0008cd038b5954b32bca426795d0f44abb147a561e2f7debad8c87e667b8f8c3fd3c56dd"
};

const a2 = {
  address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCisr",
  ergoTree: "0008cd0278011ec0cf5feb92d61adb51dcb75876627ace6fd9446ab4cabc5313ab7b39a7"
};

describe("basic construction", () => {
  const token1 = "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489";

  it("Should create a empty transaction builder", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock);

    expect(builder.inputs).toHaveLength(regularBoxesMock.length);
    expect(builder.dataInputs).toHaveLength(0);
    expect(builder.outputs).toHaveLength(0);
    expect(builder.changeAddress).toBeFalsy();
    expect(builder.fee).toBeFalsy();
    expect(builder.burning).toBeFalsy();
    expect(builder.settings).toBeTruthy();
    expect(builder.creationHeight).toBe(height);
  });

  it("Should add data inputs", () => {
    const builder = new TransactionBuilder(height)
      .from(regularBoxesMock)
      .withDataFrom(regularBoxesMock.slice(0, 2));

    expect(builder.inputs).toHaveLength(regularBoxesMock.length);
    expect(builder.dataInputs).toHaveLength(2);
    expect(builder.outputs).toHaveLength(0);
  });

  it("Should add outputs", () => {
    const builder = new TransactionBuilder(height)
      .from(regularBoxesMock)
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, a1.address, height));

    expect(builder.outputs).toHaveLength(1);
    expect(builder.inputs).toHaveLength(regularBoxesMock.length);
    expect(builder.dataInputs).toHaveLength(0);
  });

  it("Should set change address by base58 encoded address", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock).sendChangeTo(a1.address);

    expect(builder.changeAddress?.toString()).toBe(a1.address);
  });

  it("Should set change address by ErgoTree", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock).sendChangeTo(a1.ergoTree);

    expect(builder.changeAddress?.toString()).toBe(a1.address);
    expect(builder.changeAddress?.ergoTree).toBe(a1.ergoTree);
    expect(builder.changeAddress?.network).toBe(Network.Mainnet);
  });

  it("Should set change address by ErgoAddress", () => {
    const address = ErgoAddress.fromBase58(a1.address);
    const builder = new TransactionBuilder(height).from(regularBoxesMock).sendChangeTo(address);

    expect(builder.changeAddress).toBe(address);
  });

  it("Should set fee amount", () => {
    const fee = RECOMMENDED_MIN_FEE_VALUE * 3n;
    const builder = new TransactionBuilder(height).from(regularBoxesMock).payFee(fee);

    expect(builder.fee).toBe(fee);
  });

  it("Should set min recommended fee amount", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock).payMinFee();

    expect(builder.fee).toBe(RECOMMENDED_MIN_FEE_VALUE);
  });

  it("Should set burning tokens", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock).burnTokens({
      tokenId: token1,
      amount: "1"
    });

    expect(builder.burning).toHaveLength(1);
    expect(builder.burning?.toArray()[0]).toEqual({ tokenId: token1, amount: 1n });
  });

  it("Should set transaction building settings", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock);
    expect(builder.settings.canBurnTokens).toBeFalsy();
    expect(builder.settings.maxTokensPerChangeBox).toBe(MAX_TOKENS_PER_BOX);

    builder.configure((settings) => {
      settings.allowTokenBurn(true).setMaxTokensPerChangeBox(10);
    });

    expect(builder.settings.canBurnTokens).toBeTruthy();
    expect(builder.settings.maxTokensPerChangeBox).toBe(10);
  });

  it("Should eject context", () => {
    const builder = new TransactionBuilder(height).from(regularBoxesMock);

    builder.eject(({ inputs, dataInputs, outputs, burning, settings }) => {
      expect(inputs).toBe(builder.inputs);
      expect(dataInputs).toBe(builder.dataInputs);
      expect(outputs).toBe(builder.outputs);
      expect(burning).toBe(builder.burning);
      expect(settings).toBe(builder.settings);
    });
  });
});

describe("Building", () => {
  it("Should build without change and fee", () => {
    const inputs = [first(regularBoxesMock)];
    const inputsSum = sumBy(inputs, (x) => x.value);
    const transaction = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(inputsSum, a1.address))
      .build();

    expect(transaction.inputs).toHaveLength(inputs.length);
    expect(transaction.inputs).toEqual(
      inputs.map((input) => ({ boxId: input.boxId, extension: {} }))
    );

    expect(transaction.dataInputs).toHaveLength(0);

    expect(transaction.outputs).toHaveLength(1);
    expect(sumBy(transaction.outputs, (x) => toBigInt(x.value))).toBe(inputsSum);
    expect(transaction.outputs.flatMap((x) => x.assets)).toHaveLength(0);
  });

  it("Should build without change", () => {
    const inputs = [first(regularBoxesMock)];
    const inputsSum = sumBy(inputs, (x) => x.value);
    const transaction = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(inputsSum - RECOMMENDED_MIN_FEE_VALUE, a1.address))
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    expect(transaction.inputs).toHaveLength(inputs.length);
    expect(transaction.inputs).toEqual(
      inputs.map((input) => ({ boxId: input.boxId, extension: {} }))
    );

    expect(transaction.dataInputs).toHaveLength(0);

    expect(transaction.outputs).toHaveLength(2);
    const customOutput = transaction.outputs[0];
    const feeOutput = transaction.outputs[1];

    expect(customOutput.ergoTree).toBe(a1.ergoTree);
    expect(customOutput.creationHeight).toBe(height);
    expect(toBigInt(customOutput.value)).toBe(inputsSum - RECOMMENDED_MIN_FEE_VALUE);
    expect(customOutput.assets).toHaveLength(0);
    expect(customOutput.additionalRegisters).toEqual({});

    expect(feeOutput.ergoTree).toBe(FEE_CONTRACT);
    expect(feeOutput.creationHeight).toBe(height);
    expect(toBigInt(feeOutput.value)).toBe(RECOMMENDED_MIN_FEE_VALUE);
    expect(feeOutput.assets).toHaveLength(0);
    expect(feeOutput.additionalRegisters).toEqual({});

    expect(sumBy(transaction.outputs, (x) => toBigInt(x.value))).toBe(inputsSum);
  });

  it("Should build with only ERG change", () => {
    const inputs = [first(regularBoxesMock)];
    const inputsSum = sumBy(inputs, (x) => x.value);
    const change = inputsSum - RECOMMENDED_MIN_FEE_VALUE;

    const transaction = new TransactionBuilder(height)
      .from(inputs)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(a1.address)
      .build();

    expect(transaction.inputs).toHaveLength(inputs.length);
    expect(transaction.inputs).toEqual(
      inputs.map((input) => ({ boxId: input.boxId, extension: {} }))
    );

    expect(transaction.dataInputs).toHaveLength(0);

    expect(transaction.outputs).toHaveLength(2);
    const feeOutput = transaction.outputs[0];
    const changeOutput = transaction.outputs[1];

    expect(feeOutput.ergoTree).toBe(FEE_CONTRACT);
    expect(feeOutput.creationHeight).toBe(height);
    expect(toBigInt(feeOutput.value)).toBe(RECOMMENDED_MIN_FEE_VALUE);
    expect(feeOutput.assets).toHaveLength(0);
    expect(feeOutput.additionalRegisters).toEqual({});

    expect(changeOutput.ergoTree).toBe(a1.ergoTree);
    expect(changeOutput.creationHeight).toBe(height);
    expect(toBigInt(changeOutput.value)).toBe(change);
    expect(changeOutput.assets).toHaveLength(0);
    expect(changeOutput.additionalRegisters).toEqual({});

    expect(sumBy(transaction.outputs, (x) => toBigInt(x.value))).toBe(inputsSum);
  });

  it("Should build with one input only ERG change", () => {
    const inputs = [first(regularBoxesMock)];
    const inputsSum = sumBy(inputs, (x) => x.value);
    const change = inputsSum - RECOMMENDED_MIN_FEE_VALUE - SAFE_MIN_BOX_VALUE;

    const transaction = new TransactionBuilder(height)
      .from(inputs)
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, a2.address, height + 1))
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(a1.address)
      .build();

    expect(transaction.inputs).toHaveLength(inputs.length);
    expect(transaction.inputs).toEqual(
      inputs.map((input) => ({ boxId: input.boxId, extension: {} }))
    );

    expect(transaction.dataInputs).toHaveLength(0);

    expect(transaction.outputs).toHaveLength(3);
    const customOutput = transaction.outputs[0];
    const feeOutput = transaction.outputs[1];
    const changeOutput = transaction.outputs[2];

    expect(customOutput.ergoTree).toBe(a2.ergoTree);
    expect(customOutput.creationHeight).toBe(height + 1); // should preserve height
    expect(toBigInt(customOutput.value)).toBe(SAFE_MIN_BOX_VALUE);
    expect(customOutput.assets).toHaveLength(0);
    expect(customOutput.additionalRegisters).toEqual({});

    expect(feeOutput.ergoTree).toBe(FEE_CONTRACT);
    expect(feeOutput.creationHeight).toBe(height);
    expect(toBigInt(feeOutput.value)).toBe(RECOMMENDED_MIN_FEE_VALUE);
    expect(feeOutput.assets).toHaveLength(0);
    expect(feeOutput.additionalRegisters).toEqual({});

    expect(changeOutput.ergoTree).toBe(a1.ergoTree);
    expect(changeOutput.creationHeight).toBe(height);
    expect(toBigInt(changeOutput.value)).toBe(change);
    expect(changeOutput.assets).toHaveLength(0);
    expect(changeOutput.additionalRegisters).toEqual({});

    expect(sumBy(transaction.outputs, (x) => toBigInt(x.value))).toBe(inputsSum);
  });

  it("Should build with multiple inputs and tokens with change", () => {
    const boxes = regularBoxesMock.filter((input) =>
      [
        "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52",
        "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
        "490148afdc36f5459bbfd84922a446abea9a1077e031822f377b0ff3a6e467e3"
      ].includes(input.boxId)
    );

    const transaction = new TransactionBuilder(height)
      .from(boxes)
      .to(
        new OutputBuilder(SAFE_MIN_BOX_VALUE, a2.address).addTokens({
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 100n
        })
      )
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(a1.address)
      .build();

    expect(transaction.inputs).toHaveLength(2);
    expect(transaction.dataInputs).toHaveLength(0);
    expect(transaction.outputs).toHaveLength(3);
    const customOutput = transaction.outputs[0];
    const feeOutput = transaction.outputs[1];
    const changeOutput = transaction.outputs[2];

    expect(customOutput.ergoTree).toBe(a2.ergoTree);
    expect(customOutput.creationHeight).toBe(height);
    expect(customOutput.value).toBe(SAFE_MIN_BOX_VALUE.toString());
    expect(customOutput.assets).toEqual([
      {
        tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
        amount: "100"
      }
    ]);
    expect(customOutput.additionalRegisters).toEqual({});

    expect(feeOutput.ergoTree).toBe(FEE_CONTRACT);
    expect(feeOutput.creationHeight).toBe(height);
    expect(feeOutput.value).toBe(RECOMMENDED_MIN_FEE_VALUE.toString());
    expect(feeOutput.assets).toHaveLength(0);
    expect(feeOutput.additionalRegisters).toEqual({});

    expect(changeOutput.ergoTree).toBe(a1.ergoTree);
    expect(changeOutput.creationHeight).toBe(height);
    expect(changeOutput.value).toBe("67498900000");
    expect(changeOutput.assets).toEqual([
      {
        tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
        amount: "9900"
      }
    ]);
    expect(changeOutput.additionalRegisters).toEqual({});
  });

  it("Should build with multiple inputs and tokens with change and input inclusion insurance", () => {
    const boxes = regularBoxesMock.filter((input) =>
      [
        "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52",
        "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
      ].includes(input.boxId)
    );

    const transaction = new TransactionBuilder(height)
      .from(boxes, (selector) =>
        selector.ensureInclusion(
          (input) =>
            input.boxId === "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
        )
      )
      .to(
        new OutputBuilder(500000000n, a2.address).addTokens({
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 180n
        })
      )
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .sendChangeTo(a1.address)
      .build("default");

    expect(transaction.inputs).toEqual([
      { boxId: "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d", extension: {} },
      { boxId: "3e67b4be7012956aa369538b46d751a4ad0136138760553d5400a10153046e52", extension: {} }
    ]);
    expect(transaction.inputs).toHaveLength(2);
    expect(transaction.dataInputs).toHaveLength(0);
    expect(transaction.outputs).toHaveLength(3);
    const customOutput = transaction.outputs[0];
    const feeOutput = transaction.outputs[1];
    const changeOutput = transaction.outputs[2];

    expect(customOutput.ergoTree).toBe(a2.ergoTree);
    expect(customOutput.creationHeight).toBe(height);
    expect(customOutput.value).toBe("500000000");
    expect(customOutput.assets).toEqual([
      {
        tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
        amount: "180"
      }
    ]);
    expect(customOutput.additionalRegisters).toEqual({});

    expect(feeOutput.ergoTree).toBe(FEE_CONTRACT);
    expect(feeOutput.creationHeight).toBe(height);
    expect(feeOutput.value).toBe(RECOMMENDED_MIN_FEE_VALUE.toString());
    expect(feeOutput.assets).toHaveLength(0);
    expect(feeOutput.additionalRegisters).toEqual({});

    expect(changeOutput.ergoTree).toBe(a1.ergoTree);
    expect(changeOutput.creationHeight).toBe(height);
    expect(changeOutput.value).toBe("499900000");
    expect(changeOutput.assets).toEqual([
      {
        tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
        amount: "10"
      },
      {
        tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
        amount: "9820"
      }
    ]);
    expect(changeOutput.additionalRegisters).toEqual({});
  });

  it("Should produce multiple change boxes and run multiple input selections if necessary", () => {
    const transaction = new TransactionBuilder(height)
      .from(manyTokensBoxesMock)
      .to(
        new OutputBuilder(2200000n, a2.address)
          .addTokens({
            tokenId: "31d6f93435540f52f067efe2c5888b8d4c4418a4fd28156dd834102c8336a804",
            amount: 1n
          })
          .addTokens({
            tokenId: "8565b6d9b72d0cb8ca052f7e5b8cdf32905333b9e026162e3a6d585ae78e697b",
            amount: 1n
          })
      )
      .payFee(RECOMMENDED_MIN_FEE_VALUE * 2n)
      .sendChangeTo(a1.address)
      .build();

    expect(transaction.inputs).toHaveLength(3);
    expect(transaction.dataInputs).toHaveLength(0);
    expect(transaction.outputs).toHaveLength(5);
    const customOutput = transaction.outputs[0];
    const feeOutput = transaction.outputs[1];
    const change1 = transaction.outputs[2];
    const change2 = transaction.outputs[3];
    const change3 = transaction.outputs[4];

    expect(customOutput.ergoTree).toBe(a2.ergoTree);
    expect(customOutput.creationHeight).toBe(height);
    expect(customOutput.value).toBe("2200000");
    expect(customOutput.assets).toEqual([
      { tokenId: "31d6f93435540f52f067efe2c5888b8d4c4418a4fd28156dd834102c8336a804", amount: "1" },
      { tokenId: "8565b6d9b72d0cb8ca052f7e5b8cdf32905333b9e026162e3a6d585ae78e697b", amount: "1" }
    ]);
    expect(customOutput.additionalRegisters).toEqual({});

    expect(feeOutput.ergoTree).toBe(FEE_CONTRACT);
    expect(feeOutput.creationHeight).toBe(height);
    expect(feeOutput.value).toBe((RECOMMENDED_MIN_FEE_VALUE * 2n).toString());
    expect(feeOutput.assets).toHaveLength(0);
    expect(feeOutput.additionalRegisters).toEqual({});

    expect(change1.ergoTree).toBe(a1.ergoTree);
    expect(change1.creationHeight).toBe(height);
    expect(change1.value).toBe("1122108");
    expect(change1.assets).toHaveLength(MAX_TOKENS_PER_BOX);
    expect(change1.additionalRegisters).toEqual({});

    expect(change2.ergoTree).toBe(a1.ergoTree);
    expect(change2.creationHeight).toBe(height);
    expect(change2.value).toBe(SAFE_MIN_BOX_VALUE.toString());
    expect(change2.assets).toHaveLength(MAX_TOKENS_PER_BOX);
    expect(change2.additionalRegisters).toEqual({});

    expect(change3.ergoTree).toBe(a1.ergoTree);
    expect(change3.creationHeight).toBe(height);
    expect(change3.value).toBe(SAFE_MIN_BOX_VALUE.toString());
    expect(change3.assets).toHaveLength(32);
    expect(change3.additionalRegisters).toEqual({});
  });

  it("Should produce multiple change boxes based on maxTokensPerChangeBox param", () => {
    const tokensPerBox = 2;

    const transaction = new TransactionBuilder(height)
      .from(regularBoxesMock, (selector) => selector.ensureInclusion((i) => some(i.assets)))
      .sendChangeTo(a1.address)
      .configure((settings) => settings.setMaxTokensPerChangeBox(tokensPerBox))
      .build();

    expect(transaction.inputs).toHaveLength(4);
    expect(transaction.dataInputs).toHaveLength(0);
    expect(transaction.outputs).toHaveLength(11);

    for (let i = 0; i < transaction.outputs.length; i++) {
      if (i < transaction.outputs.length - 1) {
        expect(transaction.outputs[i].assets).toHaveLength(tokensPerBox);
      } else {
        expect(transaction.outputs[i].assets.length <= tokensPerBox).toBeTruthy();
      }
    }
  });

  it("Should build in EIP-12 format", () => {
    const transaction = new TransactionBuilder(height)
      .from(regularBoxesMock)
      .withDataFrom(regularBoxesMock[1])
      .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, a2.address))
      .payMinFee()
      .sendChangeTo(a1.address)
      .build("EIP-12");

    expect(transaction.inputs).toEqual([
      {
        additionalRegisters: {},
        assets: [],
        boxId: "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
        creationHeight: 284761,
        ergoTree:
          "100204a00b08cd021dde34603426402615658f1d970cfa7c7bd92ac81a8b16eeebff264d59ce4604ea02d192a39a8cc7a70173007301",
        extension: {},
        index: 1,
        transactionId: "9148408c04c2e38a6402a7950d6157730fa7d49e9ab3b9cadec481d7769918e9",
        value: "67500000000"
      }
    ]);

    expect(transaction.dataInputs).toEqual([
      {
        additionalRegisters: {
          R4: "110780f0b252a4048088bdfa9e60808c8d9e0200c80180f8efcc9f60",
          R5: "0e20aae3684e4e7c78c8d8e62f866345bd5c70543ac73f4a06142292f0693c9bdd60"
        },
        assets: [
          {
            amount: "226642336",
            tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283"
          }
        ],
        boxId: "a2c9821f5c2df9c320f17136f043b33f7716713ab74c84d687885f9dd39d2c8a",
        creationHeight: 805063,
        ergoTree:
          "1012040204000404040004020406040c0408040a050004000402040204000400040404000400d812d601b2a4730000d602e4c6a7050ed603b2db6308a7730100d6048c720302d605db6903db6503fed606e4c6a70411d6079d997205b27206730200b27206730300d608b27206730400d609b27206730500d60a9972097204d60b95917205b272067306009d9c7209b27206730700b272067308007309d60c959272077208997209720a999a9d9c7207997209720b7208720b720ad60d937204720cd60e95720db2a5730a00b2a5730b00d60fdb6308720ed610b2720f730c00d6118c720301d612b2a5730d00d1eded96830201aedb63087201d901134d0e938c721301720293c5b2a4730e00c5a79683050193c2720ec2720193b1720f730f938cb2720f731000017202938c7210017211938c721002720cec720dd801d613b2db630872127311009683060193c17212c1a793c27212c2a7938c7213017211938c721302997204720c93e4c67212050e720293e4c6721204117206",
        extension: {},
        index: 0,
        transactionId: "f82fa15166d787c275a6a5ab29983f6386571c63e50c73c1af7cba184f85ef23",
        value: "1000000"
      }
    ]);
  });
});
