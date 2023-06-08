import { ErgoAddress } from "@fleet-sdk/core";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeed, mnemonicToSeedSync } from "@scure/bip39";

/**
 * Ergo derivation path at change level
 */
export const ERGO_HD_CHANGE_PATH = "m/44'/429'/0'/0";

export type FromMnemonicOptions = {
  passphrase?: string;
  path?: string;
};

export class ErgoHDKey {
  private readonly _root: HDKey;
  private readonly _publicKey: Uint8Array;
  private readonly _address: ErgoAddress;

  private constructor(hdKey: HDKey) {
    /* c8 ignore next 3 */
    if (!hdKey.publicKey) {
      throw new Error("Public key is not present");
    }

    this._root = hdKey;
    this._publicKey = hdKey.publicKey;
    this._address = ErgoAddress.fromPublicKey(this._publicKey);
  }

  get publicKey(): Uint8Array {
    return this._publicKey;
  }

  get privateKey(): Uint8Array | null {
    return this._root.privateKey;
  }

  get chainCode(): Uint8Array | null {
    return this._root.chainCode;
  }

  get extendedPublicKey(): string {
    return this._root.publicExtendedKey;
  }

  get extendedPrivateKey(): string {
    return this._root.privateExtendedKey;
  }

  get index(): number {
    return this._root.index;
  }

  get depth(): number {
    return this._root.depth;
  }

  get address(): ErgoAddress {
    return this._address;
  }

  static async fromMnemonic(mnemonic: string, options?: FromMnemonicOptions): Promise<ErgoHDKey> {
    return this.fromMasterSeed(await mnemonicToSeed(mnemonic, options?.passphrase), options?.path);
  }

  static fromMnemonicSync(mnemonic: string, options?: FromMnemonicOptions): ErgoHDKey {
    return this.fromMasterSeed(mnemonicToSeedSync(mnemonic, options?.passphrase), options?.path);
  }

  static fromMasterSeed(seed: Uint8Array, path = ERGO_HD_CHANGE_PATH): ErgoHDKey {
    const key = HDKey.fromMasterSeed(seed);
    if (path !== "") {
      return new ErgoHDKey(key.derive(path));
    }

    return new ErgoHDKey(key);
  }

  static fromExtendedKey(base58EncodedExtKey: string): ErgoHDKey {
    return new ErgoHDKey(HDKey.fromExtendedKey(base58EncodedExtKey));
  }

  deriveChild(index: number): ErgoHDKey {
    return new ErgoHDKey(this._root.deriveChild(index));
  }

  derive(path: string): ErgoHDKey {
    return new ErgoHDKey(this._root.derive(path));
  }

  wipePrivateData(): ErgoHDKey {
    this._root.wipePrivateData();

    return this;
  }
}
