import { isEmpty } from "@fleet-sdk/common";

/**
 * EC point type
 */
enum EcPointType {
  /**
   * Compressed, positive Y coordinate
   */
  Compressed = 0x02,
  /**
   * Compressed, negative Y coordinate
   */
  CompressedOdd = 0x03,
  /**
   * Uncompressed
   */
  Uncompressed = 0x04
}

/**
 * Validate Elliptic Curve point
 *
 * @param pointBytes EC point bytes
 * @returns True if the point is valid
 */
export function validateEcPoint(pointBytes: Uint8Array) {
  if (isEmpty(pointBytes)) return false;

  switch (pointBytes[0]) {
    case EcPointType.Compressed:
    case EcPointType.CompressedOdd:
      return pointBytes.length === 33;
    case EcPointType.Uncompressed:
      return pointBytes.length === 65;
    default:
      return false;
  }
}
