import { assert, isHex } from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeed, mnemonicToSeedSync } from "@scure/bip39";
import { base58check, hex } from "@fleet-sdk/crypto";

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

type ExtendedErgoKey = ErgoHDKey & { chainCode: Uint8Array };
type FullErgoKey = ExtendedErgoKey & { chainCode: Uint8Array; privateKey: Uint8Array };
type NeuteredErgoKey = Omit<ErgoHDKey, "privateKey" | "extendedPrivateKey">;

export class ErgoHDKey {
  readonly #root: HDKey;
  #address?: ErgoAddress;

  constructor(keyOrOpt: HDKey | PrivateKeyOptions | PublicKeyOptions) {
    if (keyOrOpt instanceof HDKey) {
      assert(!!keyOrOpt.publicKey, "Public key is not present");
      this.#root = keyOrOpt;
    } else {
      const key = new HDKey(keyOrOpt);
      this.#root = key;
    }
  }

  get publicKey(): Uint8Array {
    return this.#root.publicKey!;
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

  /**
   * Create an ErgoHDKey from an extended key
   * @param encodedKey
   */
  static fromExtendedKey(encodedKey: string): ErgoHDKey;
  /** @deprecated use the default constructor instead */
  static fromExtendedKey(options: PrivateKeyOptions): ErgoHDKey;
  /** @deprecated use the default constructor instead */
  static fromExtendedKey(options: PublicKeyOptions): ErgoHDKey;
  /** @deprecated use the default constructor instead */
  static fromExtendedKey(keyOrOptions: string | PrivateKeyOptions | PublicKeyOptions): ErgoHDKey {
    if (typeof keyOrOptions !== "string") {
      return new ErgoHDKey(keyOrOptions);
    }

    const xKey = isHex(keyOrOptions) ? base58check.encode(hex.decode(keyOrOptions)) : keyOrOptions;
    return new ErgoHDKey(HDKey.fromExtendedKey(xKey));
  }

  deriveChild(index: number): ErgoHDKey {
    return new ErgoHDKey(this.#root.deriveChild(index));
  }

  derive(path: string): ErgoHDKey {
    return new ErgoHDKey(this.#root.derive(path));
  }

  wipePrivateData(): NeuteredErgoKey {
    this.#root.wipePrivateData();
    return this;
  }

  isExtended(): this is ExtendedErgoKey {
    return this.chainCode !== undefined;
  }

  isNeutered(): this is NeuteredErgoKey {
    return this.privateKey === undefined;
  }

  hasPrivateKey(): this is FullErgoKey {
    return this.privateKey !== undefined;
  }
}
