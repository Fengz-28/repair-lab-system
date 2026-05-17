"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { InvoiceStatus } from "@prisma/client";

import {
  addQuoteItemAction,
  changeQuoteStatusAction,
  createQuoteAction,
} from "@/app/admin/tickets/[ticketId]/quotes/actions";
import { initialQuoteActionState } from "@/modules/quotes/quote.action-state";

type CatalogOption = {
  id: string;
  label: string;
  type: string;
  basePrice: string | null;
};

type QuoteItem = {
  id: string;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  catalogItemName: string | null;
};

type Quote = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: string;
  total: string;
  currency: string;
  customerNotes: string | null;
  internalNotes: string | null;
  approvalToken: string | null;
  approvalExpiresAt: string | null;
  items: QuoteItem[];
  allowedNextStatuses: InvoiceStatus[];
};

export function QuoteAdmin({
  ticketId,
  quotes,
  catalogItems,
}: {
  ticketId: string;
  quotes: Quote[];
  catalogItems: CatalogOption[];
}) {
  return (
    <div className="space-y-8">
      <CreateQuoteForm ticketId={ticketId} />
      <QuoteList ticketId={ticketId} quotes={quotes} catalogItems={catalogItems} />
    </div>
  );
}

function CreateQuoteForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useActionState(createQuoteAction, initialQuoteActionState);

  return (
    <form action={formAction} className="space-y-4 rounded border border-zinc-200 p-5">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <h2 className="text-base font-semibold text-zinc-950">Crear cotizacion</h2>
        <p className="text-sm text-zinc-600">
          Crea un estimate en borrador. La aprobacion de cliente queda como placeholder.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Expira en dias
          <input
            name="expiresInDays"
            type="number"
            min={1}
            max={90}
            defaultValue={15}
            className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Notas visibles para cliente
        <textarea
          name="customerNotes"
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Notas internas
        <textarea
          name="internalNotes"
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Crear cotizacion" pendingLabel="Creando..." />
    </form>
  );
}

function QuoteList({
  ticketId,
  quotes,
  catalogItems,
}: {
  ticketId: string;
  quotes: Quote[];
  catalogItems: CatalogOption[];
}) {
  if (quotes.length === 0) {
    return (
      <section className="rounded border border-zinc-200 p-5 text-sm text-zinc-500">
        No hay cotizaciones para este ticket.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {quotes.map((quote) => (
        <article key={quote.id} className="space-y-4 rounded border border-zinc-200 p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                {quote.invoiceNumber}
              </h2>
              <p className="text-sm text-zinc-600">Estado: {quote.status}</p>
              <p className="text-sm text-zinc-600">
                Total: {quote.currency} {quote.total}
              </p>
              {quote.approvalExpiresAt ? (
                <p className="text-sm text-zinc-500">
                  Expira: {quote.approvalExpiresAt}
                </p>
              ) : null}
            </div>
            <QuoteStatusForm ticketId={ticketId} quote={quote} />
          </div>

          <QuoteItemsTable items={quote.items} />
          {quote.status === "DRAFT" ? (
            <AddQuoteItemForm
              ticketId={ticketId}
              quoteId={quote.id}
              catalogItems={catalogItems}
            />
          ) : (
            <p className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
              Solo las cotizaciones en DRAFT pueden editar lineas.
            </p>
          )}
        </article>
      ))}
    </section>
  );
}

function QuoteItemsTable({ items }: { items: QuoteItem[] }) {
  return (
    <div className="overflow-x-auto rounded border border-zinc-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>
            <th className="border-b border-zinc-200 px-3 py-2">Tipo</th>
            <th className="border-b border-zinc-200 px-3 py-2">Descripcion</th>
            <th className="border-b border-zinc-200 px-3 py-2">Cantidad</th>
            <th className="border-b border-zinc-200 px-3 py-2">Unitario</th>
            <th className="border-b border-zinc-200 px-3 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-zinc-500" colSpan={5}>
                Sin lineas todavia.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-3 py-2">{item.itemType}</td>
                <td className="px-3 py-2">
                  <p>{item.description}</p>
                  {item.catalogItemName ? (
                    <p className="text-zinc-500">Catalogo: {item.catalogItemName}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">{item.unitPrice}</td>
                <td className="px-3 py-2">{item.lineTotal}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddQuoteItemForm({
  ticketId,
  quoteId,
  catalogItems,
}: {
  ticketId: string;
  quoteId: string;
  catalogItems: CatalogOption[];
}) {
  const [state, formAction] = useActionState(addQuoteItemAction, initialQuoteActionState);

  return (
    <form action={formAction} className="grid gap-3 rounded border border-zinc-200 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <h3 className="text-sm font-semibold text-zinc-950">Agregar linea</h3>
      <div className="grid gap-3 md:grid-cols-5">
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Catalogo opcional
          <select
            name="catalogItemId"
            className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">Manual</option>
            {catalogItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Tipo
          <select
            name="itemType"
            defaultValue="SERVICE"
            className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="SERVICE">SERVICE</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="PART">PART</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800 md:col-span-2">
          Descripcion
          <input
            name="description"
            required
            className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Cantidad
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Precio unitario
          <input
            name="unitPrice"
            type="number"
            step="0.01"
            className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <p className="text-xs text-zinc-500">
        Si seleccionas catalogo y dejas precio vacio, se usa su precio base.
      </p>
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Agregar linea" pendingLabel="Agregando..." />
    </form>
  );
}

function QuoteStatusForm({ ticketId, quote }: { ticketId: string; quote: Quote }) {
  const [state, formAction] = useActionState(
    changeQuoteStatusAction,
    initialQuoteActionState,
  );

  if (quote.allowedNextStatuses.length === 0) {
    return <p className="text-sm text-zinc-500">Estado final</p>;
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="quoteId" value={quote.id} />
      <select
        name="nextStatus"
        className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
      >
        {quote.allowedNextStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <input
        name="internalComment"
        placeholder="Comentario interno opcional"
        className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Cambiar estado" pendingLabel="Cambiando..." />
    </form>
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
      className="w-fit rounded bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
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

