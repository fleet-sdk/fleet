import { describe, expect, it } from "vitest";
import {
  FEE_CONTRACT,
  type EIP12UnsignedTransaction,
  type BoxCandidate,
  type EIP12UnsignedInput
} from "@fleet-sdk/common";
import { 
  validateTransaction,
  checkMinNanoergsPerBox,
  checkMinerFee,
  isFeeContract,
  DEFAULT_MIN_FEE_PER_BYTE,
  type TransactionCheckOptions
} from "./transactionChecks";
import { BLOCKCHAIN_PARAMETERS } from "./execution";

describe("Transaction Checks", () => {
  describe("checkMinNanoergsPerBox", () => {
    it("Should pass when all boxes meet minimum value requirements", () => {
      const outputs: BoxCandidate<string>[] = [
        {
          value: "1000000", // 1,000,000 nanoergs
          ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
          creationHeight: 100,
          assets: [],
          additionalRegisters: {}
        }
      ];

      const errors = checkMinNanoergsPerBox(outputs, BLOCKCHAIN_PARAMETERS.minValuePerByte);
      expect(errors).to.have.length(0);
    });

    it("Should fail when a box doesn't meet minimum value requirement", () => {
      const outputs: BoxCandidate<string>[] = [
        {
          value: "1000", // Too small
          ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
          creationHeight: 100,
          assets: [],
          additionalRegisters: {}
        }
      ];

      const errors = checkMinNanoergsPerBox(outputs, BLOCKCHAIN_PARAMETERS.minValuePerByte);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.include("insufficient value");
    });

    it("Should calculate minimum value based on box size", () => {
      const outputs: BoxCandidate<string>[] = [
        {
          value: "50000",
          ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
          creationHeight: 100,
          assets: [
            { tokenId: "0".repeat(64), amount: "100" },
            { tokenId: "1".repeat(64), amount: "200" }
          ],
          additionalRegisters: {
            R4: "0580897a",
            R5: "0e20" + "a".repeat(64)
          }
        }
      ];

      const errors = checkMinNanoergsPerBox(outputs, BLOCKCHAIN_PARAMETERS.minValuePerByte);
      expect(errors).to.have.length(1);
      expect(errors[0]).to.include("insufficient value");
      expect(errors[0]).to.include("bytes");
    });
  });

  describe("checkMinerFee", () => {
    it("Should pass when fee box is present and meets threshold", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "2100000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "1000000",
            ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          },
          {
            value: "1100000", // Fee box
            ergoTree: FEE_CONTRACT,
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const result = checkMinerFee(transaction, DEFAULT_MIN_FEE_PER_BYTE);
      expect(result.errors).to.have.length(0);
      expect(result.warnings).to.have.length(0);
    });

    it("Should warn when no fee box is present", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "1000000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "1000000",
            ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const result = checkMinerFee(transaction, DEFAULT_MIN_FEE_PER_BYTE);
      expect(result.errors).to.have.length(0);
      expect(result.warnings).to.have.length(1);
      expect(result.warnings[0]).to.include("No miner fee box found");
    });

    it("Should fail when fee is below threshold", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "1000100",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "1000000",
            ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          },
          {
            value: "100", // Too small fee
            ergoTree: FEE_CONTRACT,
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const result = checkMinerFee(transaction, DEFAULT_MIN_FEE_PER_BYTE);
      expect(result.errors).to.have.length(1);
      expect(result.errors[0]).to.include("below minimum");
    });

    it("Should recognize custom fee trees", () => {
      const customFeeTree = "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a70173007301";
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "2000000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "2000000", // Fee box with custom tree
            ergoTree: customFeeTree,
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const result = checkMinerFee(transaction, DEFAULT_MIN_FEE_PER_BYTE, [customFeeTree]);
      expect(result.errors).to.have.length(0);
      expect(result.warnings).to.have.length(0);
    });

    it("Should handle multiple fee boxes", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "1200000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "600000", // First fee box
            ergoTree: FEE_CONTRACT,
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          },
          {
            value: "600000", // Second fee box
            ergoTree: FEE_CONTRACT,
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const result = checkMinerFee(transaction, DEFAULT_MIN_FEE_PER_BYTE);
      expect(result.errors).to.have.length(0);
      expect(result.warnings).to.have.length(1);
      expect(result.warnings[0]).to.include("2 fee boxes");
      expect(result.warnings[0]).to.include("1200000 nanoergs");
    });
  });

  describe("validateTransaction", () => {
    it("Should perform all checks by default", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "1000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "1000", // Too small
            ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const result = validateTransaction(transaction, BLOCKCHAIN_PARAMETERS);
      expect(result.success).to.be.false;
      expect(result.errors.length).to.be.greaterThan(0);
      expect(result.warnings).to.have.length(1); // No fee box warning
    });

    it("Should allow disabling specific checks", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "1000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "1000", // Too small, but check is disabled
            ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const options: TransactionCheckOptions = {
        checkMinNanoergsPerBox: false,
        checkMinerFee: false
      };

      const result = validateTransaction(transaction, BLOCKCHAIN_PARAMETERS, options);
      expect(result.success).to.be.true;
      expect(result.errors).to.have.length(0);
      expect(result.warnings).to.have.length(0);
    });

    it("Should use custom fee thresholds", () => {
      const mockInput: EIP12UnsignedInput = {
        boxId: "a".repeat(64),
        extension: {},
        transactionId: "b".repeat(64),
        index: 0,
        ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
        creationHeight: 99,
        value: "2000000",
        assets: [],
        additionalRegisters: {}
      };
      
      const transaction: EIP12UnsignedTransaction = {
        inputs: [mockInput],
        dataInputs: [],
        outputs: [
          {
            value: "1000000",
            ergoTree: "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482",
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          },
          {
            value: "100000", // Small fee but meets box minimum value requirements
            ergoTree: FEE_CONTRACT,
            creationHeight: 100,
            assets: [],
            additionalRegisters: {}
          }
        ]
      };

      const options: TransactionCheckOptions = {
        minFeePerByte: BigInt(100) // Matches the default;
      };

      const result = validateTransaction(transaction, BLOCKCHAIN_PARAMETERS, options);
      expect(result.success).to.be.true;
      expect(result.errors).to.have.length(0);
    });
  });

  describe("isFeeContract", () => {
    it("Should recognize standard fee contract", () => {
      expect(isFeeContract(FEE_CONTRACT)).to.be.true;
    });

    it("Should not recognize random ErgoTree as fee contract", () => {
      const randomTree = "0008cd03b196b194d3360c21c1d42d52c32a65e996b98525781bd7bb7f5fdfec596a0482";
      expect(isFeeContract(randomTree)).to.be.false;
    });

    it("Should recognize custom fee contracts", () => {
      const customFee = "custom_fee_tree_123";
      expect(isFeeContract(customFee, [customFee])).to.be.true;
      expect(isFeeContract("other_tree", [customFee])).to.be.false;
    });
  });
});
