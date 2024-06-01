import { assert } from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeed, mnemonicToSeedSync } from "@scure/bip39";

/**
 * Ergo derivation path at change level
 */
export const ERGO_CHANGE_PATH = "m/44'/429'/0'/0";

export type FromMnemonicOptions = {
  passphrase?: string;
  path?: string;
};

export type HDKeyOptions = {
  depth?: number;
  index?: number;
  parentFingerprint?: number;
  chainCode?: Uint8Array;
};

export type PrivateKeyOptions = HDKeyOptions & {
  privateKey: Uint8Array | bigint;
};

export type PublicKeyOptions = HDKeyOptions & {
  publicKey: Uint8Array;
};

export class ErgoHDKey {
  readonly #root: HDKey;
  readonly #publicKey: Uint8Array;

  #address?: ErgoAddress;

  private constructor(key: HDKey) {
    assert(!!key.publicKey, "Public key is not present");

    this.#root = key;
    this.#publicKey = key.publicKey;
  }

  get publicKey(): Uint8Array {
    return this.#publicKey;
  }

  get privateKey(): Uint8Array | undefined {
    return this.#root.privateKey ?? undefined;
  }

  get chainCode(): Uint8Array | undefined {
    return this.#root.chainCode ?? undefined;
  }

  get extendedPublicKey(): string {
    return this.#root.publicExtendedKey;
  }

  get extendedPrivateKey(): string {
    return this.#root.privateExtendedKey;
  }

  get index(): number {
    return this.#root.index;
  }

  get depth(): number {
    return this.#root.depth;
  }

  get address(): ErgoAddress {
    if (!this.#address) {
      this.#address = ErgoAddress.fromPublicKey(this.publicKey);
    }

    return this.#address;
  }

  static async fromMnemonic(mnemonic: string, options?: FromMnemonicOptions): Promise<ErgoHDKey> {
    return this.fromMasterSeed(await mnemonicToSeed(mnemonic, options?.passphrase), options?.path);
  }

  static fromMnemonicSync(mnemonic: string, options?: FromMnemonicOptions): ErgoHDKey {
    return this.fromMasterSeed(mnemonicToSeedSync(mnemonic, options?.passphrase), options?.path);
  }

  static fromMasterSeed(seed: Uint8Array, path = ERGO_CHANGE_PATH): ErgoHDKey {
    const key = HDKey.fromMasterSeed(seed);
    if (path !== "") return new ErgoHDKey(key.derive(path));

    return new ErgoHDKey(key);
  }

  static fromExtendedKey(options: PrivateKeyOptions): ErgoHDKey;
  static fromExtendedKey(options: PublicKeyOptions): ErgoHDKey;
  static fromExtendedKey(encodedKey: string): ErgoHDKey;
  static fromExtendedKey(keyOrOptions: string | PrivateKeyOptions | PublicKeyOptions): ErgoHDKey {
    const rootKey =
      typeof keyOrOptions === "string"
        ? HDKey.fromExtendedKey(keyOrOptions)
        : new HDKey(keyOrOptions);

    return new ErgoHDKey(rootKey);
  }

  deriveChild(index: number): ErgoHDKey {
    return new ErgoHDKey(this.#root.deriveChild(index));
  }

  derive(path: string): ErgoHDKey {
    return new ErgoHDKey(this.#root.derive(path));
  }

  wipePrivateData(): ErgoHDKey {
    this.#root.wipePrivateData();

    return this;
  }
}
