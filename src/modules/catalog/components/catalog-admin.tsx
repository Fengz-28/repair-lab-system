"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  adjustInventoryAction,
  createCatalogItemAction,
  updateCatalogInventoryTrackingAction,
  updateCatalogItemStatusAction,
} from "@/app/admin/catalog/actions";
import { InventoryEmptyState } from "@/components/repairlab/inventory-empty-state";
import { InventoryItemCard } from "@/components/repairlab/inventory-item-card";
import { RepairInventoryTable } from "@/components/repairlab/inventory-table";
import { RepairBadge, RepairPanel } from "@/components/repairlab";
import { initialCatalogActionState } from "@/modules/catalog/catalog.action-state";

type CatalogAdminItem = {
  id: string;
  type: string;
  sku: string | null;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: string | null;
  costPrice: string | null;
  priceStartsAt: boolean;
  estimatedDurationMinutes: number | null;
  trackInventory: boolean;
  isActive: boolean;
  isPublic: boolean;
  inventoryItem: {
    id: string;
    quantityOnHand: number;
    reorderLevel: number;
    location: string | null;
    movements: {
      id: string;
      type: string;
      quantity: number;
      reason: string | null;
      referenceType: string | null;
      referenceId: string | null;
      notes: string | null;
      createdAt: string;
    }[];
  } | null;
};

export function CatalogAdmin({ items }: { items: CatalogAdminItem[] }) {
  return (
    <div className="space-y-8">
      <CreateCatalogItemForm />
      <CatalogList items={items} />
    </div>
  );
}

function CreateCatalogItemForm() {
  const [state, formAction] = useActionState(
    createCatalogItemAction,
    initialCatalogActionState,
  );

  return (
    <form
      id="crear-item"
      action={formAction}
      className="space-y-6 rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-sm shadow-black/25 sm:p-6"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Nuevo item
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Crear item comercial</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Servicios, productos y repuestos para cotizaciones, facturas, web publica futura e inventario real cuando aplique.
          </p>
        </div>
        <RepairBadge tone="cyan">Catalogo flexible</RepairBadge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Tipo"
          name="type"
          options={["SERVICE", "PRODUCT", "PART"]}
          defaultValue="SERVICE"
        />
        <TextField label="Nombre" name="name" required />
        <TextField label="SKU" name="sku" />
        <TextField label="Categoria" name="category" />
        <TextField label="Precio base / venta" name="basePrice" type="number" step="0.01" />
        <TextField label="Costo" name="costPrice" type="number" step="0.01" />
        <TextField
          label="Duracion estimada min."
          name="estimatedDurationMinutes"
          type="number"
        />
        <TextField label="Stock inicial" name="initialStock" type="number" />
        <TextField label="Stock minimo" name="reorderLevel" type="number" />
        <TextField label="Ubicacion" name="location" />
      </div>

      <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
        Descripcion
        <textarea
          name="description"
          rows={3}
          className={fieldClassName}
        />
      </label>

      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <CheckField name="priceStartsAt" label="Precio desde" />
        <CheckField name="isActive" label="Activo" defaultChecked />
        <CheckField name="isPublic" label="Preparado para web publica" />
        <CheckField name="trackInventory" label="Controla stock" />
      </div>

      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Crear item" pendingLabel="Creando..." />
    </form>
  );
}

function CatalogList({ items }: { items: CatalogAdminItem[] }) {
  return (
    <section id="catalogo" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Stock management
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Catalogo interno</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Cards operativas para administrar stock y tabla compacta para escaneo rapido.
          </p>
        </div>
        <RepairBadge tone="emerald">{items.length} items</RepairBadge>
      </div>

      {items.length === 0 ? (
        <InventoryEmptyState hasItems={false} />
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            {items.map((item) => (
              <InventoryItemCard
                key={item.id}
                title={item.name}
                subtitle={item.category ?? "Sin categoria"}
                sku={item.sku}
                typeLabel={itemTypeLabel(item.type)}
                price={priceLabel(item)}
                cost={item.costPrice ? `CRC ${item.costPrice}` : null}
                duration={item.estimatedDurationMinutes ? `${item.estimatedDurationMinutes} min` : null}
                active={item.isActive}
                publicReady={item.isPublic}
                stockLabel={stockLabel(item)}
                stockTone={stockTone(item)}
              >
                <div className="grid gap-4">
                  <InventoryPanel item={item} />
                  <CatalogStatusForm item={item} />
                </div>
              </InventoryItemCard>
            ))}
          </div>

          <RepairInventoryTable>
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                <tr>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Precio</TableHeader>
                  <TableHeader>Stock</TableHeader>
                  <TableHeader>Estado</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((item) => (
                  <tr key={item.id} className="align-top transition hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="px-4 py-4">{itemTypeLabel(item.type)}</td>
                    <td className="px-4 py-4">
                      <p className="break-words font-black text-zinc-950 dark:text-zinc-50">{item.name}</p>
                      <p className="break-words text-zinc-500 dark:text-zinc-400">{item.category ?? "Sin categoria"}</p>
                      {item.sku ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">SKU {item.sku}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold">{priceLabel(item)}</p>
                      {item.costPrice ? <p className="text-zinc-500 dark:text-zinc-400">Costo: CRC {item.costPrice}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      <RepairBadge tone={stockTone(item)}>{stockLabel(item)}</RepairBadge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <RepairBadge tone={item.isActive ? "emerald" : "neutral"}>{item.isActive ? "Activo" : "Inactivo"}</RepairBadge>
                        {item.isPublic ? <RepairBadge tone="cyan">Web publica</RepairBadge> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </RepairInventoryTable>
        </>
      )}
    </section>
  );
}

function CatalogStatusForm({ item }: { item: CatalogAdminItem }) {
  const [state, formAction] = useActionState(
    updateCatalogItemStatusAction,
    initialCatalogActionState,
  );

  return (
    <form action={formAction} className="grid gap-2 sm:max-w-xs">
      <input name="catalogItemId" type="hidden" value={item.id} />
      <input name="isActive" type="hidden" value={item.isActive ? "false" : "true"} />
      <SubmitButton
        label={item.isActive ? "Desactivar item" : "Activar item"}
        pendingLabel="Actualizando..."
        tone="secondary"
      />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function InventoryPanel({ item }: { item: CatalogAdminItem }) {
  if (item.type === "SERVICE") {
    return (
      <RepairPanel className="bg-white dark:bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Servicio sin control de stock.</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Los servicios alimentan precios y cotizaciones, pero no descuentan inventario.
        </p>
      </RepairPanel>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <InventoryBadge item={item} />
        {isLowStock(item) ? <RepairBadge tone="warning">Stock bajo</RepairBadge> : null}
      </div>
      {item.trackInventory && item.inventoryItem ? (
        <>
          <InventoryAdjustForm item={item} />
          <InventoryMovements movements={item.inventoryItem.movements} />
        </>
      ) : (
        <InventoryTrackingForm item={item} />
      )}
    </div>
  );
}

function InventoryTrackingForm({ item }: { item: CatalogAdminItem }) {
  const [state, formAction] = useActionState(
    updateCatalogInventoryTrackingAction,
    initialCatalogActionState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input name="catalogItemId" type="hidden" value={item.id} />
      <input name="trackInventory" type="hidden" value="true" />
      <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Este item puede usarse sin descontar stock. Activa control solo si quieres manejar inventario real.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="initialStock" type="number" min={0} placeholder="Stock inicial" className={smallFieldClassName} />
        <input name="reorderLevel" type="number" min={0} placeholder="Stock minimo" className={smallFieldClassName} />
        <input name="location" type="text" placeholder="Ubicacion" className={smallFieldClassName} />
      </div>
      <SubmitButton label="Activar control de stock" pendingLabel="Activando..." />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function InventoryAdjustForm({ item }: { item: CatalogAdminItem }) {
  const [state, formAction] = useActionState(
    adjustInventoryAction,
    initialCatalogActionState,
  );

  if (!item.inventoryItem) {
    return null;
  }

  return (
    <form action={formAction} className="grid gap-3">
      <input name="inventoryItemId" type="hidden" value={item.inventoryItem.id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StockMetric label="Actual" value={String(item.inventoryItem.quantityOnHand)} />
        <StockMetric label="Minimo" value={String(item.inventoryItem.reorderLevel)} />
        <StockMetric label="Ubicacion" value={item.inventoryItem.location ?? "No definida"} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select name="type" className={smallFieldClassName} defaultValue="IN">
          <option value="IN">Entrada</option>
          <option value="OUT">Salida</option>
          <option value="ADJUSTMENT">Ajuste</option>
        </select>
        <input name="quantity" type="number" min={1} placeholder="Cantidad" className={smallFieldClassName} required />
        <input name="reason" type="text" placeholder="Motivo" className={smallFieldClassName} required />
        <input name="notes" type="text" placeholder="Notas opcionales" className={smallFieldClassName} />
      </div>
      <SubmitButton label="Ajustar inventario" pendingLabel="Ajustando..." />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function InventoryMovements({
  movements,
}: {
  movements: NonNullable<CatalogAdminItem["inventoryItem"]>["movements"];
}) {
  if (movements.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin movimientos recientes.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        Movimientos recientes
      </p>
      <div className="grid gap-2">
        {movements.map((movement) => (
          <div key={movement.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-black text-zinc-950 dark:text-zinc-50">
                {inventoryMovementLabel(movement.type)} {movement.quantity}
              </p>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{movement.createdAt}</span>
            </div>
            <p className="mt-1 break-words text-zinc-500 dark:text-zinc-400">{movement.reason ?? "Sin motivo"}</p>
            {movement.referenceType ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Ref: {movement.referenceType} {movement.referenceId ?? ""}
              </p>
            ) : null}
            {movement.notes ? <p className="mt-1 break-words text-xs text-zinc-500 dark:text-zinc-400">{movement.notes}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryBadge({ item }: { item: CatalogAdminItem }) {
  return <RepairBadge tone={item.trackInventory ? "emerald" : "neutral"}>{item.trackInventory ? "Controla stock" : "Sin control de stock"}</RepairBadge>;
}

function TextField({
  label,
  name,
  type = "text",
  step,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        className={fieldClassName}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
      {label}
      <select name={name} defaultValue={defaultValue} className={fieldClassName}>
        {options.map((option) => (
          <option key={option} value={option}>
            {itemTypeLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckField({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-emerald-500" />
      {label}
    </label>
  );
}

function StockMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-zinc-200 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] dark:border-zinc-800">{children}</th>;
}

function itemTypeLabel(type: string) {
  const labels: Record<string, string> = {
    SERVICE: "Servicio",
    PRODUCT: "Producto",
    PART: "Repuesto",
  };

  return labels[type] ?? type;
}

function inventoryMovementLabel(type: string) {
  const labels: Record<string, string> = {
    IN: "Entrada",
    OUT: "Salida",
    ADJUSTMENT: "Ajuste",
    RESERVED: "Reservado",
    RELEASED: "Liberado",
  };

  return labels[type] ?? type;
}

function priceLabel(item: CatalogAdminItem) {
  if (!item.basePrice) {
    return "Manual";
  }

  return `${item.priceStartsAt ? "Desde " : ""}CRC ${item.basePrice}`;
}

function isLowStock(item: CatalogAdminItem) {
  return Boolean(
    item.trackInventory &&
      item.inventoryItem &&
      item.inventoryItem.quantityOnHand <= item.inventoryItem.reorderLevel,
  );
}

function stockLabel(item: CatalogAdminItem) {
  if (item.type === "SERVICE") {
    return "Sin stock";
  }

  if (!item.trackInventory || !item.inventoryItem) {
    return "Sin control";
  }

  if (item.inventoryItem.quantityOnHand <= 0) {
    return "Agotado";
  }

  if (item.inventoryItem.quantityOnHand <= item.inventoryItem.reorderLevel) {
    return `Bajo: ${item.inventoryItem.quantityOnHand}`;
  }

  return `Stock: ${item.inventoryItem.quantityOnHand}`;
}

function stockTone(item: CatalogAdminItem): "neutral" | "emerald" | "warning" | "danger" {
  if (item.type === "SERVICE" || !item.trackInventory || !item.inventoryItem) {
    return "neutral";
  }

  if (item.inventoryItem.quantityOnHand <= 0) {
    return "danger";
  }

  if (item.inventoryItem.quantityOnHand <= item.inventoryItem.reorderLevel) {
    return "warning";
  }

  return "emerald";
}

function SubmitButton({
  label,
  pendingLabel,
  tone = "primary",
}: {
  label: string;
  pendingLabel: string;
  tone?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const toneClass =
    tone === "secondary"
      ? "border border-white/10 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
      : "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:border disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none ${toneClass}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`rounded-2xl border p-3 text-sm font-semibold ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
      }`}
      role="status"
    >
      {message}
    </p>
  );
}

const fieldClassName =
  "min-h-12 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";

const smallFieldClassName =
  "min-h-11 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";
