export function resolveVariantPrice(
  variant: { price: number | null; b2bPrice: number | null },
  isB2B: boolean,
): number | null {
  if (isB2B && variant.b2bPrice != null) return variant.b2bPrice;
  return variant.price;
}
