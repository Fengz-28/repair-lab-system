"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { InvoiceStatus, TicketStatus } from "@prisma/client";

import {
  addQuoteItemAction,
  changeQuoteStatusAction,
  createQuoteAction,
} from "@/app/admin/tickets/[ticketId]/quotes/actions";
import { RepairButton, RepairEmptyState } from "@/components/repairlab";
import { RepairInventoryTable } from "@/components/repairlab/inventory-table";
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
  ticketStatus,
  quotes,
  catalogItems,
}: {
  ticketId: string;
  ticketStatus: TicketStatus;
  quotes: Quote[];
  catalogItems: CatalogOption[];
}) {
  const mainQuote = quotes[0];

  return (
    <div className="space-y-8">
      <GuidedQuoteFlow ticketStatus={ticketStatus} quote={mainQuote} />
      <CreateQuoteForm ticketId={ticketId} />
      <QuoteList ticketId={ticketId} quotes={quotes} catalogItems={catalogItems} />
    </div>
  );
}

function GuidedQuoteFlow({
  ticketStatus,
  quote,
}: {
  ticketStatus: TicketStatus;
  quote?: Quote;
}) {
  return (
    <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Flujo comercial
          </p>
          <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">
            Flujo de cotizacion
          </h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Crear cotizacion en borrador.</li>
            <li>Agregar lineas con precios mientras este en borrador.</li>
            <li>Revisar el total estimado.</li>
            <li>Enviar la cotizacion al cliente.</li>
            <li>Esperar aprobacion o rechazo.</li>
          </ol>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            El precio se coloca en las lineas de la cotizacion, no en el ticket.
          </p>
        </div>
        <div className="grid w-full gap-2 text-sm sm:w-auto">
          <StatusPill label="Ticket" value={ticketStatusLabel(ticketStatus)} tone="ticket" />
          <StatusPill
            label="Cotizacion"
            value={quote ? quoteStatusLabel(quote.status) : "Sin cotizacion"}
            tone="quote"
          />
        </div>
      </div>
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-100">
        <p className="font-black">Siguiente paso recomendado</p>
        <p>{getRecommendedStep(quote)}</p>
      </div>
    </section>
  );
}

function CreateQuoteForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useActionState(createQuoteAction, initialQuoteActionState);

  return (
    <form id="crear-cotizacion" action={formAction} className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
          Nueva propuesta
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Crear cotizacion</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Crea una cotizacion en borrador. Luego agrega mano de obra, repuestos o servicios con precio.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Expira en dias
          <input
            name="expiresInDays"
            type="number"
            min={1}
            max={90}
            defaultValue={15}
            className={fieldClassName}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Notas visibles para cliente
        <textarea
          name="customerNotes"
          rows={3}
          className={fieldClassName}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Notas internas
        <textarea
          name="internalNotes"
          rows={3}
          className={fieldClassName}
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
      <RepairEmptyState
        title="No hay cotizaciones para este ticket."
        description="Crea una cotizacion en borrador para empezar a definir precios."
      />
    );
  }

  return (
    <section className="space-y-4">
      {quotes.map((quote) => (
        <article key={quote.id} className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 transition hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800 sm:p-6">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Cotizacion</p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">
                {quote.invoiceNumber}
              </h2>
              <StatusBadge status={quote.status} />
              <p className="mt-3 text-3xl font-black text-zinc-950 dark:text-zinc-50">
                Total estimado: {quote.currency} {quote.total}
              </p>
              {quote.approvalExpiresAt ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Expira: {quote.approvalExpiresAt}
                </p>
              ) : null}
            </div>
            <div className="grid w-full gap-3 sm:w-auto">
              <RepairButton href={`/admin/tickets/${ticketId}/quotes/${quote.id}/pdf`} tone="secondary" size="sm">
                Descargar cotizacion PDF
              </RepairButton>
              <QuoteStatusForm ticketId={ticketId} quote={quote} />
            </div>
          </div>

          <QuoteItemsTable items={quote.items} />
          {quote.status === "DRAFT" ? (
            <AddQuoteItemForm
              ticketId={ticketId}
              quoteId={quote.id}
              catalogItems={catalogItems}
            />
          ) : (
            <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Esta cotizacion ya no se puede editar porque fue enviada, aprobada, rechazada o expirada.
            </p>
          )}
        </article>
      ))}
    </section>
  );
}

function QuoteItemsTable({ items }: { items: QuoteItem[] }) {
  return (
    <RepairInventoryTable>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
          <tr>
            <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Tipo</th>
            <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Descripcion</th>
            <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Cantidad</th>
            <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Unitario</th>
            <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-zinc-500 dark:text-zinc-400" colSpan={5}>
                Aun no hay lineas. Agrega mano de obra, repuestos, productos o servicios para formar el precio final.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 last:border-0 transition hover:bg-emerald-50/50 dark:border-zinc-800 dark:hover:bg-emerald-950/20">
                <td className="px-3 py-2">{quoteItemTypeLabel(item.itemType)}</td>
                <td className="px-3 py-2">
                  <p className="break-words">{item.description}</p>
                  {item.catalogItemName ? (
                    <p className="text-zinc-500 dark:text-zinc-400">Catalogo: {item.catalogItemName}</p>
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
    </RepairInventoryTable>
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
    <form action={formAction} className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <div>
        <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Agregar precio</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Agrega aqui mano de obra, repuestos, productos o servicios. Estos valores forman el precio final de la cotizacion.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Catalogo opcional
          <select
            name="catalogItemId"
            className={fieldClassName}
          >
            <option value="">Manual</option>
            {catalogItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Tipo
          <select
            name="itemType"
            defaultValue="SERVICE"
            className={fieldClassName}
          >
            <option value="SERVICE">Servicio</option>
            <option value="PRODUCT">Producto</option>
            <option value="PART">Repuesto</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 lg:col-span-2">
          Descripcion
          <input
            name="description"
            required
            className={fieldClassName}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Cantidad
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            className={fieldClassName}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Precio unitario
          <input
            name="unitPrice"
            type="number"
            step="0.01"
            className={fieldClassName}
          />
        </label>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Si seleccionas un item del catalogo y dejas el precio vacio, se usa su precio base. Total de linea = cantidad x precio unitario.
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

  const availableStatuses = quote.allowedNextStatuses.filter((status) => {
    if (status === "SENT") {
      return quote.items.length > 0;
    }

    if (status === "APPROVED") {
      return quote.items.length > 0 && Number(quote.total) > 0;
    }

    if (status === "EXPIRED") {
      return quote.status === "SENT";
    }

    return true;
  });

  if (quote.allowedNextStatuses.length === 0) {
    return (
      <p className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        Esta cotizacion ya esta en un estado final.
      </p>
    );
  }

  if (availableStatuses.length === 0) {
    return (
      <p className="max-w-xs rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        Agrega lineas con total mayor a cero antes de enviar o aprobar esta cotizacion.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="quoteId" value={quote.id} />
      <select
        name="nextStatus"
        className={fieldClassName}
      >
        {availableStatuses.map((status) => (
          <option key={status} value={status}>
            {quoteStatusActionLabel(status)}
          </option>
        ))}
      </select>
      <input
        name="internalComment"
        placeholder="Comentario interno opcional"
        className={fieldClassName}
      />
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Actualizar cotizacion" pendingLabel="Actualizando..." />
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
      className="min-h-11 w-full rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:bg-zinc-400 sm:w-fit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const classes: Record<InvoiceStatus, string> = {
    DRAFT: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
    SENT: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
    APPROVED: "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-100",
    REJECTED: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
    EXPIRED: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    CANCELLED: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
    PAID: "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-100",
    PARTIALLY_PAID: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
    UNPAID: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
  };

  return (
    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${classes[status]}`}>
      {quoteStatusLabel(status)}
    </span>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ticket" | "quote";
}) {
  const classes =
    tone === "ticket"
      ? "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-100"
      : "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${classes}`}>
      <p className="text-xs font-medium uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function getRecommendedStep(quote?: Quote) {
  if (!quote) {
    return "Crea una cotizacion para empezar a definir precios.";
  }

  if (quote.status === "DRAFT" && quote.items.length === 0) {
    return "Agrega servicios, repuestos o productos con precio antes de enviarla.";
  }

  if (quote.status === "DRAFT") {
    return "Revisa el total y envia la cotizacion al cliente.";
  }

  if (quote.status === "SENT") {
    return "La cotizacion fue enviada. Ahora espera aprobacion o rechazo del cliente.";
  }

  if (quote.status === "APPROVED") {
    return "La cotizacion fue aprobada. El siguiente paso futuro sera convertirla en factura o continuar reparacion.";
  }

  if (quote.status === "REJECTED") {
    return "La cotizacion fue rechazada. Puedes crear una nueva cotizacion o volver a diagnostico.";
  }

  if (quote.status === "EXPIRED") {
    return "La cotizacion expiro. Puedes crear una nueva cotizacion.";
  }

  return "Revisa el estado actual antes de continuar.";
}

function quoteStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
    PAID: "Pagada",
    PARTIALLY_PAID: "Pago parcial",
    UNPAID: "Sin pago",
  };

  return labels[status] ?? status;
}

function quoteStatusActionLabel(status: InvoiceStatus) {
  const labels: Partial<Record<InvoiceStatus, string>> = {
    SENT: "Enviar al cliente",
    APPROVED: "Marcar como aprobada",
    REJECTED: "Marcar como rechazada",
    EXPIRED: "Marcar como expirada",
  };

  return labels[status] ?? quoteStatusLabel(status);
}

function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revision inicial",
    DIAGNOSIS: "Diagnostico",
    WAITING_APPROVAL: "Esperando aprobacion",
    APPROVED: "Aprobado",
    REPAIR_IN_PROGRESS: "Reparacion en proceso",
    READY_FOR_PICKUP: "Listo para retirar",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}

function quoteItemTypeLabel(type: string) {
  const labels: Record<string, string> = {
    SERVICE: "Servicio",
    PRODUCT: "Producto",
    PART: "Repuesto",
  };

  return labels[type] ?? type;
}

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`rounded border p-2 text-xs ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
      role="status"
    >
      {message}
    </p>
  );
}

const fieldClassName =
  "min-h-11 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-emerald-900";
