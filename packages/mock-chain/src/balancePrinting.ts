import { type Amount, decimalize, some } from "@fleet-sdk/common";
import { type ArrayChange, diffArrays } from "diff";
import pc from "picocolors";
import type { AssetMetadataMap } from "./mockChain";
import type { PartyBalance } from "./party/mockChainParty";

const ELLIPSIS = "...";

export function stringifyBalance(
  balance: PartyBalance,
  name: string,
  width: number,
  metadata?: AssetMetadataMap
): string {
  const tokenWidth = (width * 70) / 100;

  const rows = [
    line("-", width),
    center(compact(`- ${name} -`, width - 4), width),
    line("-", width),
    between("Asset", "Balance", width),
    line("=", width),
    between(
      metaName("nanoerg", metadata),
      metaAmount("nanoerg", balance.nanoergs, metadata),
      width
    ),
  ];

  if (some(balance.tokens)) {
    for (const token of balance.tokens) {
      rows.push(
        between(
          metaName(token.tokenId, metadata),
          metaAmount(token.tokenId, token.amount, metadata),
          width,
          tokenWidth
        )
      );
    }
  }

  rows.push(line("-", width));

  return rows.join("\n");
}

function metaName(key: string, metadata?: AssetMetadataMap) {
  return metadata?.get(key)?.name || key;
}

function metaAmount(key: string, amount: Amount, metadata?: AssetMetadataMap) {
  const decimals = metadata?.get(key)?.decimals;

  if (decimals) {
    return decimalize(amount, decimals);
  }

  return amount.toString();
}

export function between(
  leftStr: string,
  rightStr: string,
  length: number,
  maxLeftLength?: number
): string {
  const rlen = length - rightStr.length - 1;
  const r = compact(
    leftStr,
    maxLeftLength && maxLeftLength <= rlen ? maxLeftLength : rlen
  );
  const l = right(rightStr, length - r.length);

  return r + l;
}

export function printDiff(oldVal: string, newVal: string) {
  const diff = diffArrays(oldVal.split("\n"), newVal.split("\n"));

  diff.map((part) => part.value.map((row) => log(row, part)));
}

function log<T>(value: string, part: ArrayChange<T>) {
  const colored = part.added
    ? pc.green(`+ ${value}`)
    : part.removed
    ? pc.red(`- ${value}`)
    : pc.gray(`  ${value}`);

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(colored);
}

export function line(char: string, length: number): string {
  return maxLength(char.repeat(length), length);
}

export function maxLength(str: string, length: number): string {
  if (str.length < length) {
    return str;
  }

  return str.slice(0, length);
}

export function left(str: string, length: number): string {
  return str.padEnd(length);
}

export function right(str: string, length: number): string {
  return str.padStart(length);
}

export function center(str: string, length: number): string {
  if (str.length > length) {
    return str;
  }

  const half = (length + str.length) / 2;
  return str.padStart(half).padEnd(length);
}

export function compact(val: string, length: number): string {
  if (length >= val.length) return val;
  if (length <= 0) return "";
  if (length <= ELLIPSIS.length + 2) return maxLength(val, length);

  const fragmentSize = Math.trunc((length - ELLIPSIS.length) / 2);
  return maxLength(
    `${val.slice(0, fragmentSize).trimEnd()}${ELLIPSIS}${val
      .slice(val.length - fragmentSize)
      .trimStart()}`,
    length
  );
}
