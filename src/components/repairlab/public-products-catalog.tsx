"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FileText, PackageCheck, Search, Wrench } from "lucide-react";

import { RepairBadge, RepairButton, RepairPanel } from "@/components/repairlab";

type ProductCategory = "Consolas" | "Controles" | "Accesorios" | "Repuestos" | "Equipos";
type AvailabilityMode = "all" | "referential" | "quote";

type CatalogProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  referencePrice?: number;
  availability: "Referencial" | "Consultar" | "Bajo pedido";
  useCase: string;
  note: string;
  badge: "Consultar" | "Cotizar" | "Bajo pedido";
};

const catalogProducts: CatalogProduct[] = [
  {
    id: "ps5-recon",
    name: "PlayStation 5 reacondicionada",
    category: "Consolas",
    image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1600&q=80",
    referencePrice: 289000,
    availability: "Consultar",
    useCase: "Equipo reacondicionado para consulta previa.",
    note: "Se revisa estado, accesorios incluidos y garantÃ­a aplicable antes de coordinar entrega.",
    badge: "Consultar",
  },
  {
    id: "xbox-controller",
    name: "Control Xbox Series",
    category: "Controles",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=1600&q=80",
    referencePrice: 39000,
    availability: "Referencial",
    useCase: "Control, diagnÃ³stico o reemplazo segÃºn condiciÃ³n.",
    note: "La disponibilidad puede variar; se confirma antes de apartar o reparar.",
    badge: "Consultar",
  },
  {
    id: "kit-hdmi",
    name: "Kit de reemplazo HDMI",
    category: "Repuestos",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    referencePrice: 9800,
    availability: "Consultar",
    useCase: "Repuesto para reparaciÃ³n de puerto HDMI.",
    note: "La compatibilidad depende del modelo exacto y del diagnÃ³stico de placa.",
    badge: "Cotizar",
  },
  {
    id: "cooling-kit",
    name: "Kit de mantenimiento tÃ©rmico",
    category: "Accesorios",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=80",
    referencePrice: 12900,
    availability: "Bajo pedido",
    useCase: "Apoyo para mantenimiento preventivo y limpieza interna.",
    note: "Se recomienda revisar el equipo antes de definir materiales y alcance.",
    badge: "Bajo pedido",
  },
  {
    id: "switch-recon",
    name: "Nintendo Switch reacondicionada",
    category: "Equipos",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=1600&q=80",
    referencePrice: 149000,
    availability: "Consultar",
    useCase: "Equipo reacondicionado sujeto a revisiÃ³n final.",
    note: "Se confirma condiciÃ³n, baterÃ­a, pantalla, joy-cons y accesorios antes de vender.",
    badge: "Consultar",
  },
  {
    id: "ps4-joystick",
    name: "Joystick analÃ³gico PS4",
    category: "Repuestos",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1600&q=80",
    referencePrice: 4500,
    availability: "Referencial",
    useCase: "Repuesto para drift, desgaste o daÃ±o fÃ­sico.",
    note: "El costo final depende de mano de obra, limpieza y pruebas posteriores.",
    badge: "Cotizar",
  },
];

const categories: Array<"Todos" | ProductCategory> = ["Todos", "Consolas", "Controles", "Accesorios", "Repuestos", "Equipos"];

const availabilityModes: Array<{ id: AvailabilityMode; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "referential", label: "Referencial" },
  { id: "quote", label: "Cotizar" },
];

export function PublicProductsCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | ProductCategory>("Todos");
  const [availabilityMode, setAvailabilityMode] = useState<AvailabilityMode>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalogProducts.filter((product) => {
      const categoryOk = category === "Todos" || product.category === category;
      const searchOk =
        normalized.length === 0 ||
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized) ||
        product.useCase.toLowerCase().includes(normalized);
      const availabilityOk =
        availabilityMode === "all" ||
        (availabilityMode === "referential" && product.availability === "Referencial") ||
        (availabilityMode === "quote" && product.badge === "Cotizar");
      return categoryOk && searchOk && availabilityOk;
    });
  }, [query, category, availabilityMode]);

  const activeAvailabilityIndex = availabilityModes.findIndex((mode) => mode.id === availabilityMode);

  return (
    <section className="space-y-6">
      <RepairPanel className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Explorar catÃ¡logo</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-50">Consulta repuestos y equipos con el taller</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Usa el catÃ¡logo como referencia. FengzLab confirma disponibilidad, compatibilidad y alcance antes de
              cualquier compra o reparaciÃ³n.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
            <span className="font-black text-zinc-50">{filtered.length}</span> opciones visibles
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
            Buscar en catÃ¡logo
            <span className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cyan-200" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Consola, repuesto, control o accesorio..."
                className="repair-input-surface pl-11"
              />
            </span>
          </label>

          <div className="w-full max-w-[19rem] lg:justify-self-end">
            <p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-500">
              Tipo de consulta
            </p>
            <div className="repair-filter-3d">
              <div
                className="repair-filter-3d-selection"
                style={{ transform: `translateX(${activeAvailabilityIndex * 100}%)` }}
              />
              <div className="repair-filter-3d-list">
                {availabilityModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`repair-filter-3d-item ${availabilityMode === mode.id ? "is-active" : ""}`}
                    onClick={() => setAvailabilityMode(mode.id)}
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
        {filtered.map((product) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute left-3 top-3 rounded-full border border-cyan-300/30 bg-black/70 px-3 py-1 text-xs font-black text-cyan-100">
                {product.availability}
              </div>
            </div>

            <div className="flex flex-1 flex-col space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">{product.category}</p>
                <RepairBadge tone={product.badge === "Bajo pedido" ? "violet" : product.badge === "Cotizar" ? "warning" : "cyan"}>
                  {product.badge}
                </RepairBadge>
              </div>

              <h3 className="text-xl font-black text-zinc-50">{product.name}</h3>
              <p className="text-sm leading-6 text-zinc-300">{product.useCase}</p>

              <div className="grid gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                <InfoRow icon={PackageCheck} label="Disponibilidad" value={product.availability} />
                <InfoRow icon={Wrench} label="Nota tÃ©cnica" value={product.note} />
                <InfoRow
                  icon={FileText}
                  label="Referencia"
                  value={product.referencePrice ? `CRC ${product.referencePrice.toLocaleString("es-CR")}` : "Consultar"}
                />
              </div>

              <div className="mt-auto grid gap-2 sm:grid-cols-2">
                <RepairButton href="/contact" tone="secondary" size="sm">
                  Consultar disponibilidad
                </RepairButton>
                <RepairButton href="/contact" size="sm">
                  Solicitar cotizaciÃ³n
                </RepairButton>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <RepairPanel className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Sin coincidencias</p>
          <h3 className="mt-3 text-2xl font-black text-zinc-50">No encontramos opciones con ese filtro.</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Ajusta la bÃºsqueda o cambia la categorÃ­a. TambiÃ©n puedes escribir al taller para consultar una pieza que no
            aparezca en el catÃ¡logo.
          </p>
        </RepairPanel>
      ) : null}
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof PackageCheck; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-cyan-200" />
      <p>
        <span className="font-black text-zinc-100">{label}: </span>
        <span className="text-zinc-400">{value}</span>
      </p>
    </div>
  );
}
