import {
  generateMnemonic as generate,
  validateMnemonic as validate
} from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english";

export function generateMnemonic(strength = 160, wordlist = english): string {
  return generate(wordlist, strength);
}

export function validateMnemonic(
  mnemonic: string,
  wordlist = english
): boolean {
  return validate(mnemonic, wordlist);
}
