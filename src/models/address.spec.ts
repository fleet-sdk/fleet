import { InvalidAddressError } from "../errors/invalidAddressError";
import { Network } from "../types";
import { Address } from "./address";

export const FEE_ERGO_TREE =
  "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304";
export const FEE_MAINNET_ADDRESS =
  "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe";
export const FEE_TESTNET_ADDRESS =
  "Bf1X9JgQTUtgntaer91B24n6kP8L2kqEiQqNf1z97BKo9UbnW3WRP9VXu8BXd1LsYCiYbHJEdWKxkF5YNx5n7m31wsDjbEuB3B13ZMDVBWkepGmWfGa71otpFViHDCuvbw1uNicAQnfuWfnj8fbCa4";

describe("Address validation", () => {
  it("Should validate VALID address from address string", () => {
    expect(Address.validate("9iPgSVU3yrRnTxtJC6hYA7bS5mMqZtjeJHrT3fNdLV7JZVpY5By")).toBeTruthy();
    expect(Address.validate("3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3")).toBeTruthy();
    expect(Address.validate(FEE_TESTNET_ADDRESS)).toBeTruthy();
    expect(Address.validate(FEE_MAINNET_ADDRESS)).toBeTruthy();
  });

  it("Should not validate INVALID address from address string", () => {
    expect(Address.validate("9i3g6d958MpZAqwn9hrTHcqbBiY5VPYBBY6vRDszZn4koqnahin")).toBeFalsy();
  });

  it("Should not validate too small address string", () => {
    expect(Address.validate("9eBy")).toBeFalsy();
  });
});

describe("Public key", () => {
  it("Should get public key from P2PK address", () => {
    expect(
      new Address("3Wx6cHkTaavysMMXSqqvoCL1n273NmcH3auiHymFwTSpKDFzQfW3").publicKey
    ).not.toHaveLength(0);
  });

  it("Should return an empty buffer for P2S addresses", () => {
    expect(new Address(FEE_MAINNET_ADDRESS).publicKey).toHaveLength(0);
  });
});

describe("Address model - ergo-ts test set", () => {
  const testVectors = [
    {
      address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCisr",
      ergoTree: "0008cd0278011ec0cf5feb92d61adb51dcb75876627ace6fd9446ab4cabc5313ab7b39a7",
      network: Network.Mainnet,
      isValid: true
    },
    {
      sk: "8e6993a4999f009c03d9457ffcf8ff3d840ae78332c959c8e806a53fbafbbee1",
      address: "9gsLq5a12nJe33nKtjMe7NPY7o8CQAtjS9amDgALbebv1wmRXrv",
      network: Network.Mainnet,
      isValid: true
    },
    {
      sk: "ff00",
      address: "9gU3czAt9q4fQPRWBriBbpfLbRP7JrXRmB7kowtwdyw66PMRmaY",
      network: Network.Mainnet,
      isValid: true
    },
    {
      sk: "8e6993a4999f009c03d9457ffcf8ff3d840ae78332c959c8e806a53fbafbbee1",
      address: "3WxxVQqxoVSWEKG5B73eNttBX51ZZ6WXLW7fiVDgCFhzRK8R4gmk",
      network: Network.Testnet,
      isValid: true
    },
    {
      address:
        "2Z4YBkDsDvQj8BX7xiySFewjitqp2ge9c99jfes2whbtKitZTxdBYqbrVZUvZvKv6aqn9by4kp3LE1c26LCyosFnVnm6b6U1JYvWpYmL2ZnixJbXLjWAWuBThV1D6dLpqZJYQHYDznJCk49g5TUiS4q8khpag2aNmHwREV7JSsypHdHLgJT7MGaw51aJfNubyzSKxZ4AJXFS27EfXwyCLzW1K6GVqwkJtCoPvrcLqmqwacAWJPkmh78nke9H4oT88XmSbRt2n9aWZjosiZCafZ4osUDxmZcc5QVEeTWn8drSraY3eFKe8Mu9MSCcVU",
      ergoTree:
        "101004020e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a7017300730110010204020404040004c0fd4f05808c82f5f6030580b8c9e5ae040580f882ad16040204c0944004c0f407040004000580f882ad16d19683030191a38cc7a7019683020193c2b2a57300007473017302830108cdeeac93a38cc7b2a573030001978302019683040193b1a5730493c2a7c2b2a573050093958fa3730673079973089c73097e9a730a9d99a3730b730c0599c1a7c1b2a5730d00938cc7b2a5730e0001a390c1a7730f",
      network: Network.Mainnet,
      isValid: true
    },
    {
      address: "88dhgzEuTXaSLUWK1Ro8mB5xfhwP4y8osUycdBV16EBgycjcBebwd2He7QGiXC1qiSM1KZ6bAcpE2iCv",
      network: Network.Mainnet,
      isValid: true
    },
    {
      address: "9fMPy1XY3GW4T6t3LjYofqmzER6x9cV21n5UVJTWmma4Y9mAW6c",
      ergoTree: "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7",
      network: Network.Mainnet,
      isValid: true
    },
    {
      address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCiss",
      network: Network.Mainnet,
      isValid: false
    },
    {
      address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96c",
      network: Network.Mainnet,
      isValid: false
    },
    {
      address: FEE_MAINNET_ADDRESS,
      ergoTree: FEE_ERGO_TREE,
      network: Network.Mainnet,
      isValid: true
    },
    {
      address: FEE_TESTNET_ADDRESS,
      ergoTree: FEE_ERGO_TREE,
      network: Network.Testnet,
      isValid: true
    }
  ].map((o) => {
    return { ...o, instance: new Address(o.address) };
  });

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
        const address = Address.fromErgoTree(tv.ergoTree, tv.network);
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
      expect(tv.instance.isValid()).toBe(tv.isValid);
    });
  });

  test("address from sk", () => {
    testVectors.forEach((o) => {
      if (o.sk) {
        expect(Address.fromSecretKey(o.sk, o.network).toString()).toBe(o.address);
      }
    });
  });

  test("checked construction from base58", () => {
    testVectors.forEach((o) => {
      if (o.isValid) {
        expect(() => Address.fromBase58(o.address)).not.toThrow();
      } else {
        expect(() => Address.fromBase58(o.address)).toThrow();
      }
    });
  });

  test("checked construction from bytes", () => {
    testVectors.forEach((o) => {
      if (o.isValid) {
        expect(() => Address.fromBytes(o.instance.bytes)).not.toThrow();
      } else {
        expect(() => Address.fromBytes(o.instance.bytes)).toThrow(InvalidAddressError);
      }
    });
  });
});
