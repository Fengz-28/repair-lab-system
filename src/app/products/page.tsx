import { PublicProductsCatalog } from "@/components/repairlab/public-products-catalog";
import { PublicShell } from "@/components/repairlab/public-site";

export default function ProductsPage() {
  return (
    <PublicShell>
      <section className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(3,7,18,0.92),rgba(0,0,0,0.98))]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Catálogo</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
              Repuestos, accesorios y equipos
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <PublicProductsCatalog />
      </div>
    </PublicShell>
  );
}
