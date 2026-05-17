import type { NotificationTemplate } from "../notification.schema";

type RenderedEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

type TicketTemplateData = {
  customerName: string;
  ticketNumber: string;
  deviceLabel: string;
  reportedIssue?: string;
  receiptNumber?: string;
  fromStatus?: string;
  toStatus?: string;
};

type QuoteTemplateData = {
  customerName: string;
  ticketNumber: string;
  quoteNumber: string;
  total: string;
  currency: string;
};

export function renderEmailTemplate(
  template: NotificationTemplate,
  data: Record<string, unknown>,
): RenderedEmailTemplate {
  switch (template) {
    case "intake.received":
      return renderIntakeReceived(data as TicketTemplateData);
    case "ticket.status_changed":
      return renderTicketStatusChanged(data as TicketTemplateData);
    case "quote.sent":
      return renderQuoteSent(data as QuoteTemplateData);
    case "ticket.ready_for_pickup":
      return renderReadyForPickup(data as TicketTemplateData);
    case "ticket.delivered":
      return renderTicketDelivered(data as TicketTemplateData);
  }
}

function renderIntakeReceived(data: TicketTemplateData): RenderedEmailTemplate {
  const subject = `Recepcion registrada - Ticket ${data.ticketNumber}`;
  const text = [
    `Hola ${data.customerName},`,
    `Recibimos tu equipo ${data.deviceLabel}.`,
    `Ticket: ${data.ticketNumber}`,
    data.receiptNumber ? `Comprobante: ${data.receiptNumber}` : undefined,
    data.reportedIssue ? `Problema reportado: ${data.reportedIssue}` : undefined,
    "Este mensaje es un placeholder interno; todavia no se envia por SMTP real.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    text,
    html: paragraphHtml(subject, text),
  };
}

function renderTicketStatusChanged(data: TicketTemplateData): RenderedEmailTemplate {
  const subject = `Actualizacion de ticket ${data.ticketNumber}`;
  const text = [
    `Hola ${data.customerName},`,
    `Tu ticket ${data.ticketNumber} cambio de estado.`,
    data.fromStatus ? `Estado anterior: ${data.fromStatus}` : undefined,
    data.toStatus ? `Estado actual: ${data.toStatus}` : undefined,
    "Este mensaje es un placeholder interno; todavia no se envia por SMTP real.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    text,
    html: paragraphHtml(subject, text),
  };
}

function renderQuoteSent(data: QuoteTemplateData): RenderedEmailTemplate {
  const subject = `Cotizacion ${data.quoteNumber} - Ticket ${data.ticketNumber}`;
  const text = [
    `Hola ${data.customerName},`,
    `Hay una cotizacion preparada para el ticket ${data.ticketNumber}.`,
    `Cotizacion: ${data.quoteNumber}`,
    `Total: ${data.currency} ${data.total}`,
    "Este mensaje es un placeholder interno; todavia no se envia por SMTP real.",
  ].join("\n");

  return {
    subject,
    text,
    html: paragraphHtml(subject, text),
  };
}

function renderReadyForPickup(data: TicketTemplateData): RenderedEmailTemplate {
  const subject = `Equipo listo para retirar - Ticket ${data.ticketNumber}`;
  const text = [
    `Hola ${data.customerName},`,
    `Tu equipo ${data.deviceLabel} esta listo para retirar.`,
    `Ticket: ${data.ticketNumber}`,
    "Este mensaje es un placeholder interno; todavia no se envia por SMTP real.",
  ].join("\n");

  return {
    subject,
    text,
    html: paragraphHtml(subject, text),
  };
}

function renderTicketDelivered(data: TicketTemplateData): RenderedEmailTemplate {
  const subject = `Ticket entregado ${data.ticketNumber}`;
  const text = [
    `Hola ${data.customerName},`,
    `Registramos la entrega del equipo ${data.deviceLabel}.`,
    `Ticket: ${data.ticketNumber}`,
    "Este mensaje es un placeholder interno; todavia no se envia por SMTP real.",
  ].join("\n");

  return {
    subject,
    text,
    html: paragraphHtml(subject, text),
  };
}

function paragraphHtml(title: string, text: string) {
  const body = text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  return `<article><h1>${escapeHtml(title)}</h1>${body}</article>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

