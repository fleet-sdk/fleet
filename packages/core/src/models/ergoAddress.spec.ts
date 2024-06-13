import { AddressType, Network } from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { describe, expect, it, test } from "vitest";
import { FEE_CONTRACT } from "../builder";
import {
  ergoTsTestVectors,
  FEE_MAINNET_ADDRESS_TV,
  FEE_TESTNET_ADDRESS_TV,
  p2shTestVectors
} from "../tests/testVectors/ergoAddressesTestVectors";
import { publicKeyTestVectors } from "../tests/testVectors/ergoAddressesTestVectors";
import { ErgoAddress } from "./ergoAddress";
import { validateAddress } from "./utils";

describe("Construction", () => {
  it("Should construct P2PK from ErgoTree", () => {
    const ergoTree = "0008cd0278011ec0cf5feb92d61adb51dcb75876627ace6fd9446ab4cabc5313ab7b39a7";
    const address = ErgoAddress.fromErgoTree(ergoTree);

    expect(address.type).toBe(AddressType.P2PK);
    expect(address.getPublicKeys()).toHaveLength(1);
    expect(address.ergoTree).toBe(ergoTree);
    expect(address.network).to.be.equal(Network.Mainnet);
  });

  it("Should construct P2SH from ErgoTree", () => {
    const ergoTree =
      "00ea02d193b4cbe4e3010e040004300e18fd53c43ebbc8b5c53f2ccf270d1bc22740eb3855463f5faed40801";
    const address = ErgoAddress.fromErgoTree(ergoTree, Network.Mainnet);

    expect(address.type).toBe(AddressType.P2SH);
    expect(address.getPublicKeys()).toHaveLength(0);
    expect(address.ergoTree).toBe(ergoTree);
    expect(address.network).toBe(Network.Mainnet);
  });

  it("Should construct P2S from ErgoTree", () => {
    const ergoTree = FEE_CONTRACT;
    const address = ErgoAddress.fromErgoTree(ergoTree, Network.Testnet);

    expect(address.type).toBe(AddressType.P2S);
    expect(address.getPublicKeys()).toHaveLength(0);
    expect(address.ergoTree).toBe(ergoTree);
    expect(address.network).toBe(Network.Testnet);
  });

  it("Should fail if passing an encoded address in place of an ErgoTree", () => {
    expect(() => {
      ErgoAddress.fromErgoTree("3Wx6cHkTaAvysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3");
    }).toThrow();
  });

  it("Should construct P2PK from public key hex string", () => {
    const publicKey = "038d39af8c37583609ff51c6a577efe60684119da2fbd0d75f9c72372886a58a63";
    const address = ErgoAddress.fromPublicKey(publicKey);

    expect(address.type).toBe(AddressType.P2PK);
    expect(address.network).to.be.equal(Network.Mainnet);
    expect(hex.encode(address.getPublicKeys()[0])).toBe(publicKey);
  });

  it("Should construct P2PK from public key bytes", () => {
    const publicKey = hex.decode(
      "038d39af8c37583609ff51c6a577efe60684119da2fbd0d75f9c72372886a58a63"
    );
    const address = ErgoAddress.fromPublicKey(publicKey);

    expect(address.type).toBe(AddressType.P2PK);
    expect(address.network).to.be.equal(Network.Mainnet);
    expect(address.getPublicKeys()[0]).toEqual(publicKey);
  });

  it("Should construct from full hash bytes", () => {
    const hash = hex.encode(blake2b256(hex.decode(FEE_CONTRACT)));
    const address = ErgoAddress.fromHash(hash);

    expect(address.type).toBe(AddressType.P2SH);
    expect(address.network).to.be.equal(Network.Mainnet);
    expect(address.encode()).toBe("8dC5Kgb4DRXYeRxiNDizFSne24UX5BTD27LCkJB");
  });

  it("Should construct from truncated hash bytes", () => {
    const hash = blake2b256(hex.decode(FEE_CONTRACT)).subarray(0, 24);
    const address = ErgoAddress.fromHash(hash);

    expect(address.type).toBe(AddressType.P2SH);
    expect(address.network).to.be.equal(Network.Mainnet);
    expect(address.encode()).toBe("8dC5Kgb4DRXYeRxiNDizFSne24UX5BTD27LCkJB");
  });

  it("Should fail to construct from invalid hash bytes", () => {
    expect(() => {
      const hash = new Uint8Array(33);
      hash.set(blake2b256(FEE_CONTRACT));

      ErgoAddress.fromHash(hash);
    }).toThrow();

    expect(() => {
      ErgoAddress.fromHash(blake2b256(FEE_CONTRACT).subarray(0, 25));
    }).toThrow();

    expect(() => {
      ErgoAddress.fromHash(blake2b256(FEE_CONTRACT).subarray(0, 10));
    }).toThrow();
  });

  it("Should construct P2PK from encoded address", () => {
    const encodedAddress = "3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3";
    const address = ErgoAddress.fromBase58(encodedAddress);

    expect(address.type).toBe(AddressType.P2PK);
    expect(address.network).toBe(Network.Testnet);
    expect(address.getPublicKeys()).toHaveLength(1);
  });

  it("Should construct P2SH from encoded address", () => {
    const encodedAddress = "7g5LhysK7mxX8xmZdPLtFE42wwxGFjpp8VofStb";
    const address = ErgoAddress.fromBase58(encodedAddress);

    expect(address.type).toBe(AddressType.P2SH);
    expect(address.network).toBe(Network.Mainnet);
    expect(address.getPublicKeys()).toHaveLength(0);
  });

  it("Should construct P2S from encoded address", () => {
    const address = ErgoAddress.fromBase58(FEE_MAINNET_ADDRESS_TV);

    expect(address.type).toBe(AddressType.P2S);
    expect(address.network).toBe(Network.Mainnet);
    expect(address.getPublicKeys()).toHaveLength(0);
  });

  const invalidAddress = "3Wx6cHkTaAvysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3";
  it("Should fail to construct invalid encoded address", () => {
    expect(() => {
      ErgoAddress.fromBase58(invalidAddress);
    }).toThrow();

    expect(() => {
      ErgoAddress.decode(invalidAddress);
    }).toThrow();
  });

  it("Should construct from encoded address and bypass address validation", () => {
    expect(() => {
      ErgoAddress.decodeUnsafe(invalidAddress);
    }).not.toThrow();

    expect(() => {
      ErgoAddress.fromBase58(invalidAddress, true);
    }).not.toThrow();
  });
});

describe("Encoding", () => {
  it("Should encode for mainnet by default", () => {
    expect(ErgoAddress.getNetworkType(ErgoAddress.fromErgoTree(FEE_CONTRACT).encode())).toBe(
      Network.Mainnet
    );
  });

  it("Should encode on demand", () => {
    const address = ErgoAddress.fromErgoTree(FEE_CONTRACT);

    expect(ErgoAddress.getNetworkType(address.encode(Network.Mainnet))).toBe(Network.Mainnet);
    expect(ErgoAddress.getNetworkType(address.encode(Network.Testnet))).toBe(Network.Testnet);
  });
});

describe("Address validation", () => {
  it("Should not validate address (valid encoding but invalid PK)", () => {
    expect(ErgoAddress.validate("9dg7gpByCWzoXdx5VeCvHeQYjx3q2TuTjzHqHfrsMsHszG49Rfj")).to.be.false;
    expect(ErgoAddress.validate("2xgTiYUcGDwvJ41XhN2nxGajWkFa3xy9pXCMEKS8fwT8QpR19R")).to.be.false;
  });

  it("Should validate VALID address from encoded address string", () => {
    expect(
      ErgoAddress.validate("9iPgSVU3yrRnTxtJC6hYA7bS5mMqZtjeJHrT3fNdLV7JZVpY5By")
    ).toBeTruthy();

    expect(
      ErgoAddress.validate("3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3")
    ).toBeTruthy();
    expect(ErgoAddress.validate(FEE_TESTNET_ADDRESS_TV)).toBeTruthy();
    expect(ErgoAddress.validate(FEE_MAINNET_ADDRESS_TV)).toBeTruthy();
    expect(ErgoAddress.validate("8sZ2fVu5VUQKEmWt4xRRDBYzuw5aevhhziPBDGB")).toBeTruthy();
    expect(ErgoAddress.validate("7g5LhysK7mxX8xmZdPLtFE42wwxGFjpp8VofStb")).toBeTruthy();
    expect(ErgoAddress.validate("8UApt8czfFVuTgQmMwtsRBZ4nfWquNiSwCWUjMg")).toBeTruthy();
  });

  it("Should not validate INVALID address from address string", () => {
    expect(ErgoAddress.validate("9i3g6d958MpZAqwn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")).toBeFalsy();
  });

  it("Should not validate too small address string", () => {
    expect(ErgoAddress.validate("9eBy")).toBeFalsy();
  });

  it("Should get network type", () => {
    expect(ErgoAddress.getNetworkType(FEE_MAINNET_ADDRESS_TV)).toBe(Network.Mainnet);
    expect(ErgoAddress.getNetworkType(FEE_TESTNET_ADDRESS_TV)).toBe(Network.Testnet);
    expect(ErgoAddress.getNetworkType("9iPgSVU3yrRnTxtJC6hYA7bS5mMqZtjeJHrT3fNdLV7JZVpY5By")).toBe(
      Network.Mainnet
    );
    expect(ErgoAddress.getNetworkType("3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3")).toBe(
      Network.Testnet
    );
  });

  it("Should get address type", () => {
    expect(ErgoAddress.getAddressType("9iPgSVU3yrRnTxtJC6hYA7bS5mMqZtjeJHrT3fNdLV7JZVpY5By")).toBe(
      AddressType.P2PK
    );
    expect(ErgoAddress.getAddressType("3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3")).toBe(
      AddressType.P2PK
    );
    expect(ErgoAddress.getAddressType(FEE_TESTNET_ADDRESS_TV)).toBe(AddressType.P2S);
    expect(ErgoAddress.getAddressType(FEE_MAINNET_ADDRESS_TV)).toBe(AddressType.P2S);
    expect(ErgoAddress.getAddressType("8sZ2fVu5VUQKEmWt4xRRDBYzuw5aevhhziPBDGB")).toBe(
      AddressType.P2SH
    );
    expect(ErgoAddress.getAddressType("7g5LhysK7mxX8xmZdPLtFE42wwxGFjpp8VofStb")).toBe(
      AddressType.P2SH
    );
    expect(ErgoAddress.getAddressType("8UApt8czfFVuTgQmMwtsRBZ4nfWquNiSwCWUjMg")).toBe(
      AddressType.P2SH
    );
  });
});

describe("P2SH", () => {
  it("Should encode/decode", () => {
    for (const tv of p2shTestVectors) {
      expect(ErgoAddress.fromBase58(tv.encoded).ergoTree).toBe(tv.ergoTree);
      expect(ErgoAddress.fromErgoTree(tv.ergoTree).encode()).toBe(tv.encoded);
    }
  });

  it("Should encode arbitrary ErgoTree to P2SH", () => {
    const testVectors = [
      { ergoTree: FEE_CONTRACT, p2sh: "8dC5Kgb4DRXYeRxiNDizFSne24UX5BTD27LCkJB" },
      {
        ergoTree:
          "100604000e2003faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf040400040005000500d803d601e30004d602e4c6a70408d603e4c6a7050595e67201d804d604b2a5e4720100d605b2db63087204730000d606db6308a7d60799c1a7c17204d1968302019683050193c27204c2a7938c720501730193e4c672040408720293e4c672040505720393e4c67204060ec5a796830201929c998c7205029591b1720673028cb272067303000273047203720792720773057202",
        p2sh: "7RDgCgZs1w9XEgBxtyPPKyG32zhkNv3HKzBy9RE"
      }
    ];

    for (const tv of testVectors) {
      const address = ErgoAddress.fromErgoTree(tv.ergoTree);

      expect(address.toP2SH()).toBe(tv.p2sh);
      expect(ErgoAddress.getAddressType(address.toP2SH())).toBe(AddressType.P2SH);
      expect(ErgoAddress.getNetworkType(address.toP2SH())).toBe(Network.Mainnet);
      expect(ErgoAddress.getNetworkType(address.toP2SH(Network.Mainnet))).toBe(Network.Mainnet);
      expect(ErgoAddress.getNetworkType(address.toP2SH(Network.Testnet))).toBe(Network.Testnet);
    }
  });

  it("Should not double hash P2SH ErgoTree", () => {
    const p2shErgoTree =
      "00ea02d193b4cbe4e3010e040004300e1888dc65bcf63bb55e6c2bfe03b1f2b14eef7d4fe0fa32d8e8d40801";

    expect(ErgoAddress.fromErgoTree(p2shErgoTree).toP2SH()).toBe(
      "7g5LhysK7mxX8xmZdPLtFE42wwxGFjpp8VofStb"
    );
  });
});

describe("Public key", () => {
  it("Should get public key from P2PK address", () => {
    expect(
      ErgoAddress.fromBase58("3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3").getPublicKeys()
    ).not.toHaveLength(0);
  });

  it("Should return an empty buffer for P2S addresses", () => {
    expect(ErgoAddress.fromBase58(FEE_MAINNET_ADDRESS_TV).getPublicKeys()).toHaveLength(0);
  });

  it("Should create from public key hex string", () => {
    for (const testVector of publicKeyTestVectors) {
      expect(ErgoAddress.fromPublicKey(testVector.publicKey).toString()).toBe(testVector.base58);
    }
  });

  it("Should create from public key bytes", () => {
    for (const testVector of publicKeyTestVectors) {
      expect(ErgoAddress.fromPublicKey(hex.decode(testVector.publicKey)).toString()).toBe(
        testVector.base58
      );
    }
  });

  it("Should fail with invalid public keys", () => {
    const invalidPKs = [
      "01200a1c1b8fa17ec82de54bcaef96f23d7b34196c0410f6f578abdbf163b14b25", //     not starting with 0x02 or 0x03
      "09200a1c1b8fa17ec82de54bcaef96f23d7b34196c0410f6f578abdbf163b14b25", //     not starting with 0x02 or 0x03
      "02200a1c1b8fa17ec82de54bcaef96f23d7b34196c0410f6f578abdbf163b14b", //       invalid length
      "02200a1c1b8fa17ec82de54bcaef96f23d7b34196c041014b25f6f578abdbf163b1b", //   invalid length
      "000000000000000000000000000000000000000000000000000000000000000000" //      infinity point
    ];

    for (const pk of invalidPKs) {
      expect(() => ErgoAddress.fromPublicKey(pk)).to.throw("The Public Key is invalid.");
    }
  });

  it("Should generate the right public key from base58 encoded string", () => {
    for (const testVector of publicKeyTestVectors) {
      expect(hex.encode(ErgoAddress.fromBase58(testVector.base58).getPublicKeys()[0])).toBe(
        testVector.publicKey
      );
    }
  });
});

describe("ErgoTree", () => {
  it("Should convert P2PK address to equivalent ErgoTree", () => {
    expect(
      ErgoAddress.fromBase58("9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCisr").ergoTree
    ).toBe("0008cd0278011ec0cf5feb92d61adb51dcb75876627ace6fd9446ab4cabc5313ab7b39a7");
  });

  it("Should convert P2S address to equivalent ErgoTree", () => {
    expect(
      ErgoAddress.fromBase58(
        "2Z4YBkDsDvQj8BX7xiySFewjitqp2ge9c99jfes2whbtKitZTxdBYqbrVZUvZvKv6aqn9by4kp3LE1c26LCyosFnVnm6b6U1JYvWpYmL2ZnixJbXLjWAWuBThV1D6dLpqZJYQHYDznJCk49g5TUiS4q8khpag2aNmHwREV7JSsypHdHLgJT7MGaw51aJfNubyzSKxZ4AJXFS27EfXwyCLzW1K6GVqwkJtCoPvrcLqmqwacAWJPkmh78nke9H4oT88XmSbRt2n9aWZjosiZCafZ4osUDxmZcc5QVEeTWn8drSraY3eFKe8Mu9MSCcVU"
      ).ergoTree
    ).toBe(
      "101004020e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a7017300730110010204020404040004c0fd4f05808c82f5f6030580b8c9e5ae040580f882ad16040204c0944004c0f407040004000580f882ad16d19683030191a38cc7a7019683020193c2b2a57300007473017302830108cdeeac93a38cc7b2a573030001978302019683040193b1a5730493c2a7c2b2a573050093958fa3730673079973089c73097e9a730a9d99a3730b730c0599c1a7c1b2a5730d00938cc7b2a5730e0001a390c1a7730f"
    );

    expect(ErgoAddress.fromBase58(FEE_MAINNET_ADDRESS_TV).ergoTree).toBe(FEE_CONTRACT);
    expect(ErgoAddress.fromBase58(FEE_TESTNET_ADDRESS_TV).ergoTree).toBe(FEE_CONTRACT);
  });
});

describe("Address model - ergo-ts test set", () => {
  const testVectors = ergoTsTestVectors.map((o) => ({
    ...o,
    instance: ErgoAddress.decodeUnsafe(o.address)
  }));

  test("get ergoTree by address", () => {
    testVectors.forEach((tv) => {
      if (tv.ergoTree) {
        expect(tv.instance.ergoTree).toBe(tv.ergoTree);
      }
    });
  });

  test("get address by ergoTree", () => {
    testVectors.forEach((tv) => {
      if (tv.ergoTree) {
        const address = ErgoAddress.fromErgoTree(tv.ergoTree, tv.network);
        expect(address.toString()).toBe(tv.address);
      }
    });
  });

  test("check network/testnet", () => {
    testVectors.forEach((tv) => {
      if (tv.network) {
        expect(tv.instance.network).toBe(tv.network);
      }
    });
  });

  test("simple address validity test", () => {
    testVectors.forEach((tv) => {
      expect(ErgoAddress.validate(tv.address)).toBe(tv.isValid);
      expect(validateAddress(tv.address)).toBe(tv.isValid);
    });
  });

  test("checked construction from base58", () => {
    testVectors.forEach((o) => {
      if (o.isValid) {
        expect(() => ErgoAddress.decode(o.address)).not.toThrow();
      } else {
        expect(() => ErgoAddress.decode(o.address)).toThrow();
      }
    });
  });
});
