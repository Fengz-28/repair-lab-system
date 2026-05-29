import { RepairButton, RepairEmptyState } from "./index";

export function InventoryEmptyState({ hasItems }: { hasItems: boolean }) {
  return (
    <RepairEmptyState
      title={hasItems ? "No hay resultados para mostrar." : "No hay ítems de catálogo todavía."}
      description={
        hasItems
          ? "No encontramos items con los criterios actuales. Ajusta la búsqueda o revisa el catálogo completo antes de crear uno nuevo."
          : "Crea servicios, productos o repuestos para usarlos en cotizaciones, facturas e inventario cuando el taller lo necesite."
      }
      eyebrow={hasItems ? "Sin resultados" : "Catálogo vacío"}
      icon={hasItems ? "SR" : "IN"}
      action={!hasItems ? <RepairButton href="#crear-item">Crear primer item</RepairButton> : null}
      secondaryAction={!hasItems ? null : <RepairButton href="#catalogo" tone="secondary">Ver catálogo</RepairButton>}
    />
  );
}
