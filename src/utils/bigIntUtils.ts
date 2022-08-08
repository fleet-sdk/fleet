export function toBigInt(number: string | number | bigint | boolean): bigint {
  return typeof number === "bigint" ? number : BigInt(number);
}
