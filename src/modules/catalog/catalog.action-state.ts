export type CatalogActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialCatalogActionState: CatalogActionState = {
  ok: false,
  message: "",
};

