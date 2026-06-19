"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";

import { RepairBadge, RepairButton, RepairPanel } from "@/components/repairlab";

type ProductCategory = "Consolas" | "Controles" | "Accesorios" | "Repuestos" | "Equipos";
type StockMode = "all" | "stock" | "offers";

type CatalogProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockText: string;
  badge: "Consultar" | "Próximamente" | "Stock bajo";
};

const catalogProducts: CatalogProduct[] = [
  {
    id: "ps5-recon",
    name: "PlayStation 5 reacondicionada",
    category: "Consolas",
    image:
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1600&q=80",
    price: 289000,
    compareAtPrice: 329000,
    rating: 4.8,
    reviews: 19,
    inStock: true,
    stockText: "Disponible en taller",
    badge: "Consultar",
  },
  {
    id: "xbox-controller",
    name: "Control Xbox Series",
    category: "Controles",
    image:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=1600&q=80",
    price: 39000,
    rating: 4.6,
    reviews: 32,
    inStock: true,
    stockText: "Stock limitado",
    badge: "Stock bajo",
  },
  {
    id: "kit-hdmi",
    name: "Kit de reemplazo HDMI",
    category: "Repuestos",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    price: 9800,
    rating: 4.7,
    reviews: 28,
    inStock: true,
    stockText: "Disponible",
    badge: "Consultar",
  },
  {
    id: "cooling-kit",
    name: "Kit de mantenimiento térmico",
    category: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=80",
    price: 12900,
    rating: 4.5,
    reviews: 14,
    inStock: false,
    stockText: "Sin disponibilidad",
    badge: "Próximamente",
  },
  {
    id: "switch-recon",
    name: "Nintendo Switch reacondicionada",
    category: "Equipos",
    image:
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=1600&q=80",
    price: 149000,
    compareAtPrice: 179000,
    rating: 4.9,
    reviews: 11,
    inStock: true,
    stockText: "Disponible en taller",
    badge: "Consultar",
  },
  {
    id: "ps4-joystick",
    name: "Joystick analógico PS4",
    category: "Repuestos",
    image:
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1600&q=80",
    price: 4500,
    rating: 4.4,
    reviews: 23,
    inStock: true,
    stockText: "Disponible",
    badge: "Consultar",
  },
];

const categories: Array<"Todos" | ProductCategory> = [
  "Todos",
  "Consolas",
  "Controles",
  "Accesorios",
  "Repuestos",
  "Equipos",
];

const stockModes: Array<{ id: StockMode; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "stock", label: "En stock" },
  { id: "offers", label: "Ofertas" },
];

export function PublicProductsCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | ProductCategory>("Todos");
  const [stockMode, setStockMode] = useState<StockMode>("all");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalogProducts.filter((product) => {
      const categoryOk = category === "Todos" || product.category === category;
      const searchOk =
        normalized.length === 0 ||
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized);
      const stockOk =
        stockMode === "all" ||
        (stockMode === "stock" && product.inStock) ||
        (stockMode === "offers" && Boolean(product.compareAtPrice));
      return categoryOk && searchOk && stockOk;
    });
  }, [query, category, stockMode]);

  const activeStockIndex = stockModes.findIndex((mode) => mode.id === stockMode);

  return (
    <section className="space-y-6">
      <RepairPanel className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Explorar catálogo</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-50">Interfaz de tienda técnica</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Busca por tipo de producto, filtra por stock u ofertas y revisa lo más relevante sin salir del flujo.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
            <span className="font-black text-zinc-50">{filtered.length}</span> resultados visibles
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
            Buscar producto
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Consola, repuesto, control o accesorio..."
              className="repair-input-surface"
            />
          </label>

          <div className="w-full max-w-[19rem] lg:justify-self-end">
            <p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-500">
              Filtro rápido
            </p>
            <div className="repair-filter-3d">
              <div
                className="repair-filter-3d-selection"
                style={{ transform: `translateX(${activeStockIndex * 100}%)` }}
              />
              <div className="repair-filter-3d-list">
                {stockModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`repair-filter-3d-item ${stockMode === mode.id ? "is-active" : ""}`}
                    onClick={() => setStockMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                category === item
                  ? "border-cyan-300/35 bg-cyan-500/15 text-cyan-100"
                  : "border-white/10 bg-zinc-950/60 text-zinc-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </RepairPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => {
          const isWishlisted = wishlist.includes(product.id);
          return (
            <article
              key={product.id}
              className="repair-rgb-card group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-sm shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-2xl hover:shadow-cyan-950/20"
            >
              <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <button
                  type="button"
                  onClick={() =>
                    setWishlist((current) =>
                      current.includes(product.id)
                        ? current.filter((id) => id !== product.id)
                        : [...current, product.id],
                    )
                  }
                  className={`repair-focus-ring absolute right-3 top-3 rounded-full border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${
                    isWishlisted
                      ? "border-red-300/40 bg-red-500/20 text-red-100"
                      : "border-white/20 bg-black/60 text-zinc-200"
                  }`}
                  aria-label="Marcar como favorito"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="size-3.5" />
                    {isWishlisted ? "Favorito" : "Guardar"}
                  </span>
                </button>
                {product.compareAtPrice ? (
                  <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                    Oferta
                  </div>
                ) : null}
                {!product.inStock ? (
                  <div className="absolute inset-0 grid place-items-center bg-black/60">
                    <span className="rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-zinc-200">
                      Sin stock
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                    {product.category}
                  </p>
                  <RepairBadge
                    tone={
                      product.badge === "Stock bajo"
                        ? "warning"
                        : product.badge === "Próximamente"
                          ? "violet"
                          : "cyan"
                    }
                  >
                    {product.badge}
                  </RepairBadge>
                </div>

                <h3 className="text-xl font-black text-zinc-50">{product.name}</h3>

                <div className="grid gap-2 text-sm text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-100">
                      <Star className="size-3.5 fill-current" />
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">
                      {product.reviews} reseñas
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">{product.stockText}</p>
                </div>

                <div className="mt-auto rounded-2xl border border-white/10 bg-zinc-950/80 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-500">
                        Precio de referencia
                      </p>
                      <p className="mt-1 text-2xl font-black text-zinc-50">
                        CRC {product.price.toLocaleString("es-CR")}
                      </p>
                    </div>
                    {product.compareAtPrice ? (
                      <p className="text-sm text-zinc-500 line-through">
                        CRC {product.compareAtPrice.toLocaleString("es-CR")}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <RepairButton href="/contact" tone="secondary" size="sm">
                      Consultar
                    </RepairButton>
                    <RepairButton href="/services" size="sm">
                      Ver servicio
                    </RepairButton>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <RepairPanel className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Sin coincidencias</p>
          <h3 className="mt-3 text-2xl font-black text-zinc-50">No encontramos productos con ese filtro.</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Ajusta la búsqueda o cambia la categoría para volver a ver el inventario referencial del taller.
          </p>
        </RepairPanel>
      ) : null}
    </section>
  );
}

