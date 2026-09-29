const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Letter sizes in garment order, numeric sizes ascending. */
export function compareSizes(a: string, b: string): number {
  const rankA = SIZE_ORDER.indexOf(a);
  const rankB = SIZE_ORDER.indexOf(b);
  if (rankA !== -1 && rankB !== -1) return rankA - rankB;
  return a.localeCompare(b, undefined, { numeric: true });
}
