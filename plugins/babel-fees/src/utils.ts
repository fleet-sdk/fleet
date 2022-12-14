import { isDefined, isHex, isUndefined } from "@fleet-sdk/common";
import { Amount, Box, SParse } from "@fleet-sdk/core";
import { BABEL_ERGOTREE_PREFIX, BABEL_ERGOTREE_SUFFIX } from "./constants";

const TOKEN_ID_HEX_LENGTH = 64;

const BABEL_CONTRACT_LENGTH =
  BABEL_ERGOTREE_PREFIX.length + TOKEN_ID_HEX_LENGTH + BABEL_ERGOTREE_SUFFIX.length;

/**
 * Get the the price for a token unit in NanoErgs
 * @param babelBox
 * @returns
 */
export function getTokenPrice(babelBox: Box<Amount>): bigint {
  if (isUndefined(babelBox.additionalRegisters.R5) || !isValidBabelBox(babelBox)) {
    throw Error("Invalid babel box.");
  }

  return SParse(babelBox.additionalRegisters.R5);
}

/**
 * Build a Babel Fee contract for a given Token ID
 * @param tokenId
 * @returns returns a Babel Fee ErgoTree
 */
export function buildBabelContract(tokenId: string): string {
  if (!isValidTokenId(tokenId)) {
    throw new Error("Invalid Token ID");
  }

  return `${BABEL_ERGOTREE_PREFIX}${tokenId}${BABEL_ERGOTREE_SUFFIX}`;
}

function isValidTokenId(tokenId: string): boolean {
  return tokenId.length === TOKEN_ID_HEX_LENGTH && isHex(tokenId);
}

/**
 * Verify if an ErgoTree is a Babel Fee contract
 * @param tokenId
 * @returns
 */
export function isValidBabelContract(ergoTree: string): boolean {
  return (
    ergoTree.length === BABEL_CONTRACT_LENGTH &&
    ergoTree.startsWith(BABEL_ERGOTREE_PREFIX) &&
    ergoTree.endsWith(BABEL_ERGOTREE_SUFFIX)
  );
}

/**
 * Verify if a Box is a valid Babel Box
 * @param tokenId
 * @returns
 */
export function isValidBabelBox(box: Box<Amount>): boolean {
  return (
    isDefined(box.additionalRegisters.R4) &&
    isDefined(box.additionalRegisters.R5) &&
    isValidBabelContract(box.ergoTree)
  );
}

export function isBabelContractForTokenId(ergoTree: string, tokenId: string) {
  if (!isValidBabelContract(ergoTree)) {
    return false;
  }

  const extractedTokenId = ergoTree.slice(
    BABEL_ERGOTREE_PREFIX.length,
    BABEL_ERGOTREE_PREFIX.length + TOKEN_ID_HEX_LENGTH
  );

  return extractedTokenId === tokenId;
}

export function extractTokenIdFromBabelContract(ergoTree: string): string {
  if (!isValidBabelContract(ergoTree)) {
    throw new Error("Invalid Babel Fee contract");
  }

  return ergoTree.slice(
    BABEL_ERGOTREE_PREFIX.length,
    BABEL_ERGOTREE_PREFIX.length + TOKEN_ID_HEX_LENGTH
  );
}
