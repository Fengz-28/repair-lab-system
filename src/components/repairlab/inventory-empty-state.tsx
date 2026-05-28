import { RepairButton, RepairEmptyState } from "./index";

export function InventoryEmptyState({ hasItems }: { hasItems: boolean }) {
  return (
    <RepairEmptyState
      title={hasItems ? "No hay resultados para mostrar." : "No hay items de catalogo todavia."}
      description={
        hasItems
          ? "No encontramos items con los criterios actuales. Ajusta la busqueda o revisa el catalogo completo antes de crear uno nuevo."
          : "Crea servicios, productos o repuestos para usarlos en cotizaciones, facturas e inventario cuando el taller lo necesite."
      }
      eyebrow={hasItems ? "Sin resultados" : "Catalogo vacio"}
      icon={hasItems ? "SR" : "IN"}
      action={!hasItems ? <RepairButton href="#crear-item">Crear primer item</RepairButton> : null}
      secondaryAction={!hasItems ? null : <RepairButton href="#catalogo" tone="secondary">Ver catalogo</RepairButton>}
    />
  );
}
