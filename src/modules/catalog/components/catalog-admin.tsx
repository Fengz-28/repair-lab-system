"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  adjustInventoryAction,
  createCatalogItemAction,
  updateCatalogItemStatusAction,
} from "@/app/admin/catalog/actions";
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
  isActive: boolean;
  isPublic: boolean;
  inventoryItem: {
    id: string;
    quantityOnHand: number;
    reorderLevel: number;
    location: string | null;
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
    <form action={formAction} className="space-y-5 rounded border border-zinc-200 p-5 dark:border-zinc-800">
      <div>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Crear item comercial</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Servicios, productos y repuestos para quotes, invoices y web publica futura.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

      <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Descripcion
        <textarea
          name="description"
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input name="priceStartsAt" type="checkbox" />
          Precio desde
        </label>
        <label className="inline-flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked />
          Activo
        </label>
        <label className="inline-flex items-center gap-2">
          <input name="isPublic" type="checkbox" />
          Preparado para web publica
        </label>
      </div>

      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Crear item" pendingLabel="Creando..." />
    </form>
  );
}

function CatalogList({ items }: { items: CatalogAdminItem[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Catalogo interno</h2>
      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            <tr>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Tipo</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Nombre</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Precio</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Stock</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Estado</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-500 dark:text-zinc-400" colSpan={6}>
                  No hay items de catalogo.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 align-top last:border-0 dark:border-zinc-800">
                  <td className="px-3 py-3">{item.type}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">{item.category ?? "Sin categoria"}</p>
                    {item.sku ? <p className="text-zinc-500 dark:text-zinc-400">SKU: {item.sku}</p> : null}
                  </td>
                  <td className="px-3 py-3">
                    {item.basePrice ? (
                      <p>
                        {item.priceStartsAt ? "Desde " : ""}
                        CRC {item.basePrice}
                      </p>
                    ) : (
                      <p>Manual</p>
                    )}
                    {item.costPrice ? <p className="text-zinc-500 dark:text-zinc-400">Costo: {item.costPrice}</p> : null}
                    {item.estimatedDurationMinutes ? (
                      <p className="text-zinc-500 dark:text-zinc-400">{item.estimatedDurationMinutes} min</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    {item.inventoryItem ? (
                      <InventoryAdjustForm item={item} />
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">No aplica</span>
                    )}
                  </td>
                  <td className="px-3 py-3">{item.isActive ? "Activo" : "Inactivo"}</td>
                  <td className="px-3 py-3">
                    <CatalogStatusForm item={item} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CatalogStatusForm({ item }: { item: CatalogAdminItem }) {
  const [state, formAction] = useActionState(
    updateCatalogItemStatusAction,
    initialCatalogActionState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input name="catalogItemId" type="hidden" value={item.id} />
      <input name="isActive" type="hidden" value={item.isActive ? "false" : "true"} />
      <SubmitButton
        label={item.isActive ? "Desactivar" : "Activar"}
        pendingLabel="Actualizando..."
      />
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
    <form action={formAction} className="grid min-w-56 gap-2">
      <input name="inventoryItemId" type="hidden" value={item.inventoryItem.id} />
      <p>
        Actual: {item.inventoryItem.quantityOnHand} / min {item.inventoryItem.reorderLevel}
      </p>
      {item.inventoryItem.location ? (
        <p className="text-zinc-500 dark:text-zinc-400">{item.inventoryItem.location}</p>
      ) : null}
      <input
        name="quantityDelta"
        type="number"
        placeholder="+/- cantidad"
        className="min-h-9 rounded border border-zinc-300 px-2 text-sm placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        required
      />
      <input
        name="reason"
        type="text"
        placeholder="Motivo"
        className="min-h-9 rounded border border-zinc-300 px-2 text-sm placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        required
      />
      <SubmitButton label="Ajustar" pendingLabel="Ajustando..." />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
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
    <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
    <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300"
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
      className={`rounded border p-2 text-xs ${
        ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
      role="status"
    >
      {message}
    </p>
  );
}
