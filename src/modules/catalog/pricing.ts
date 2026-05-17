import type { CatalogItem } from "@prisma/client";

export type CatalogPricePreview = {
  label: string;
  amount: string | null;
};

export function getCatalogPricePreview(
  item: Pick<CatalogItem, "basePrice" | "priceStartsAt">,
): CatalogPricePreview {
  if (!item.basePrice) {
    return {
      label: "Precio manual",
      amount: null,
    };
  }

  return {
    label: item.priceStartsAt ? "Desde" : "Precio base",
    amount: item.basePrice.toString(),
  };
}

