import { RepairButton, RepairEmptyState } from "./index";

export function InventoryEmptyState({ hasItems }: { hasItems: boolean }) {
  return (
    <RepairEmptyState
      title={hasItems ? "No hay resultados para mostrar." : "No hay items de catalogo todavia."}
      description={
        hasItems
          ? "Ajusta filtros o revisa el catalogo completo."
          : "Crea servicios, productos o repuestos para alimentar cotizaciones, facturas e inventario."
      }
      action={!hasItems ? <RepairButton href="#crear-item">Crear primer item</RepairButton> : null}
    />
  );
}
