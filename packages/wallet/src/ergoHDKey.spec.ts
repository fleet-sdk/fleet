import { first } from "@fleet-sdk/common";
import { base58check, hex } from "@fleet-sdk/crypto";
import { mnemonicToSeedSync } from "@scure/bip39";
import SigmaRust from "ergo-lib-wasm-nodejs";
import { describe, expect, it } from "vitest";
import { keyAddressesTestVectors } from "./_test-vectors/keyVectors";
import { ERGO_CHANGE_PATH, ErgoHDKey } from "./ergoHDKey";
import { generateMnemonic } from "./mnemonic";

describe("Instantiation", () => {
  it("Should create from mnemonic and auto derive to ergo's default change path by default", async () => {
    const mnemonic = generateMnemonic();
    const key = await ErgoHDKey.fromMnemonic(mnemonic);
    expect(key.publicKey).not.to.be.empty;
    expect(key.privateKey).not.to.be.empty;
    expect(key.chainCode).not.to.be.empty;
    expect(key.index).to.be.equal(0);
    expect(key.depth).to.be.equal(4, "should automatically derive Ergo path.");

    const syncKey = ErgoHDKey.fromMnemonicSync(mnemonic);
    expect(key).to.be.deep.equal(syncKey);
  });

  it("Should create from master seed and derive to ergo's default change path by default", () => {
    const seed = mnemonicToSeedSync(generateMnemonic());
    const key = ErgoHDKey.fromMasterSeed(seed);

    expect(key.publicKey).not.to.be.empty;
    expect(key.privateKey).not.to.be.empty;
    expect(key.chainCode).not.to.be.empty;
    expect(key.index).to.be.equal(0);
    expect(key.depth).to.be.equal(4, "should automatically derive Ergo path.");
    expect(first(key.address.getPublicKeys())).to.be.deep.equal(key.publicKey);
  });

  it("Should should result in the same key from seed and from equivalent mnemonic", () => {
    const mnemonic = generateMnemonic();
    const seed = mnemonicToSeedSync(mnemonic);
    const keyFromSeed = ErgoHDKey.fromMasterSeed(seed);
    const keyFromMnemonic = ErgoHDKey.fromMnemonicSync(mnemonic);

    expect(keyFromSeed.publicKey).to.be.deep.equal(keyFromMnemonic.publicKey);
    expect(keyFromSeed.privateKey).to.be.deep.equal(keyFromMnemonic.privateKey);
    expect(keyFromSeed.chainCode).to.be.deep.equal(keyFromMnemonic.chainCode);
    expect(keyFromSeed.index).to.be.equal(keyFromMnemonic.index);
    expect(keyFromSeed.depth).to.be.equal(keyFromMnemonic.depth);
  });

  it("Should wipe private data", () => {
    const key = ErgoHDKey.fromMnemonicSync(generateMnemonic());
    expect(key.privateKey).not.to.be.empty;

    key.wipePrivateData();
    expect(key.privateKey).to.be.undefined;
  });
});

describe("Extended keys", () => {
  it("Should create and restore from public extended key", async () => {
    const mnemonic = generateMnemonic();
    const key = await ErgoHDKey.fromMnemonic(mnemonic);

    expect(key.privateKey).not.to.be.undefined;
    expect(key.publicKey).not.to.be.undefined;
    expect(key.chainCode).not.to.be.undefined;

    const recreatedKeyFromPk = ErgoHDKey.fromExtendedKey(key.extendedPublicKey);

    expect(recreatedKeyFromPk.privateKey).to.be.undefined;
    expect(recreatedKeyFromPk.publicKey).to.be.deep.equal(key.publicKey);
    expect(recreatedKeyFromPk.chainCode).to.be.deep.equal(key.chainCode);
  });

  it("Should create and restore from private extended key", async () => {
    const mnemonic = generateMnemonic();
    const key = await ErgoHDKey.fromMnemonic(mnemonic);

    expect(key.privateKey).not.to.be.undefined;
    expect(key.publicKey).not.to.be.undefined;
    expect(key.chainCode).not.to.be.undefined;

    const recreatedKeyFromPk = ErgoHDKey.fromExtendedKey(key.extendedPrivateKey);

    expect(recreatedKeyFromPk.privateKey).to.deep.equal(key.privateKey);
    expect(recreatedKeyFromPk.publicKey).to.be.deep.equal(key.publicKey);
    expect(recreatedKeyFromPk.chainCode).to.be.deep.equal(key.chainCode);
  });

  it("Should create and restore from extended key options method", async () => {
    const mnemonic = generateMnemonic();
    const key = await ErgoHDKey.fromMnemonic(mnemonic);

    expect(key.privateKey).not.to.be.undefined;
    expect(key.publicKey).not.to.be.undefined;
    expect(key.chainCode).not.to.be.undefined;

    const fullyRecreatedKey = ErgoHDKey.fromExtendedKey({
      depth: key.depth,
      index: key.index,
      privateKey: key.privateKey!,
      chainCode: key.chainCode!
    });
    expect(fullyRecreatedKey.depth).to.be.equal(key.depth);
    expect(fullyRecreatedKey.index).to.be.equal(key.index);
    expect(fullyRecreatedKey.privateKey).to.deep.equal(key.privateKey);
    expect(fullyRecreatedKey.publicKey).to.be.deep.equal(key.publicKey);
    expect(fullyRecreatedKey.chainCode).to.be.deep.equal(key.chainCode);

    const recreatedFromPrivateKey = ErgoHDKey.fromExtendedKey({
      privateKey: key.privateKey!
    });
    expect(recreatedFromPrivateKey.depth).to.be.equal(0);
    expect(recreatedFromPrivateKey.index).to.be.equal(0);
    expect(recreatedFromPrivateKey.privateKey).to.deep.equal(key.privateKey);
    expect(recreatedFromPrivateKey.publicKey).to.be.deep.equal(key.publicKey);
    expect(recreatedFromPrivateKey.chainCode).to.be.undefined;

    const recreatedFromPublicKey = ErgoHDKey.fromExtendedKey({
      publicKey: key.publicKey
    });
    expect(recreatedFromPublicKey.depth).to.be.equal(0);
    expect(recreatedFromPublicKey.index).to.be.equal(0);
    expect(recreatedFromPublicKey.privateKey).to.be.undefined;
    expect(recreatedFromPublicKey.publicKey).to.be.deep.equal(key.publicKey);
    expect(recreatedFromPublicKey.chainCode).to.be.undefined;
  });

  it("Should create from encoded private extended key", async () => {
    const encodedXPriv = base58check.encode(
      hex.decode(
        "0488ade4000000000000000000824d14ff80e181dc9038efd121c4e97b090ab52064f1bf3cd53a7625ecfd7f0800a8738fe8def3a4c50c25dcbd10177679c3e5aef0d42e2aea3e59b9b79f8d21f7"
      )
    );

    const key = ErgoHDKey.fromExtendedKey(encodedXPriv).derive("m/44'/429'/0'/0").deriveChild(0);
    expect(key.address.encode()).to.be.equal("9i13CmR9JpR2F6S81kokfApsWEpZsfoTPw7gRCjhX433VEsfBqq");
  });
});

describe("Key derivation", () => {
  it("Should derive and encode the correct addresses from mnemonic", async () => {
    for (const tv of keyAddressesTestVectors) {
      const key = await ErgoHDKey.fromMnemonic(tv.mnemonic);

      for (let i = 0; i < keyAddressesTestVectors.length; i++) {
        expect(key.deriveChild(i).address.encode()).to.be.equal(tv.addresses[i]);
      }
    }
  });

  it("Should not auto derive to default Ergo path if path == ''", async () => {
    for (const tv of keyAddressesTestVectors) {
      let key = await ErgoHDKey.fromMnemonic(tv.mnemonic, { path: "" });
      expect(key.depth).to.be.equal(0);
      expect(key.index).to.be.equal(0);

      key = key.derive(ERGO_CHANGE_PATH);
      expect(key.depth).to.be.equal(4);
      expect(key.index).to.be.equal(0);

      for (let i = 0; i < keyAddressesTestVectors.length; i++) {
        expect(key.deriveChild(i).address.encode()).to.be.equal(tv.addresses[i]);
      }
    }
  });

  it("Should be on pair with sigma-rust with no passphrase", () => {
    const mnemonic = generateMnemonic();

    const fleetKey = ErgoHDKey.fromMnemonicSync(mnemonic);
    const wasmKey = SigmaRust.ExtSecretKey.derive_master(mnemonicToSeedSync(mnemonic)).derive(
      SigmaRust.DerivationPath.from_string(ERGO_CHANGE_PATH)
    );

    expect(fleetKey.publicKey).to.be.deep.equal(wasmKey.public_key().pub_key_bytes());
    expect(fleetKey.privateKey).to.be.deep.equal(wasmKey.secret_key_bytes());

    for (let i = 0; i < 100; i++) {
      const fleetChild = fleetKey.deriveChild(i);
      const wasmChild = wasmKey.child(i.toString());

      expect(fleetChild.publicKey).to.be.deep.equal(wasmChild.public_key().pub_key_bytes());
      expect(fleetChild.privateKey).to.be.deep.equal(wasmChild.secret_key_bytes());
    }
  });

  it("Should be on pair with sigma-rust with passphrase", () => {
    const mnemonic = generateMnemonic();
    const passphrase = "test passphrase";

    const fleetKey = ErgoHDKey.fromMnemonicSync(mnemonic, { passphrase });
    const wasmKey = SigmaRust.ExtSecretKey.derive_master(
      SigmaRust.Mnemonic.to_seed(mnemonic, passphrase)
    ).derive(SigmaRust.DerivationPath.from_string(ERGO_CHANGE_PATH));

    expect(fleetKey.publicKey).to.be.deep.equal(wasmKey.public_key().pub_key_bytes());
    expect(fleetKey.privateKey).to.be.deep.equal(wasmKey.secret_key_bytes());

    for (let i = 0; i < 100; i++) {
      const fleetChild = fleetKey.deriveChild(i);
      const wasmChild = wasmKey.child(i.toString());

      expect(fleetChild.publicKey).to.be.deep.equal(wasmChild.public_key().pub_key_bytes());
      expect(fleetChild.privateKey).to.be.deep.equal(wasmChild.secret_key_bytes());
    }
  });
});
