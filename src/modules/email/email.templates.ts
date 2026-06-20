import type { EmailTemplateKey, RenderedTransactionalEmail } from "./email.types";

export function renderTransactionalEmail(
  template: EmailTemplateKey,
  data: Record<string, unknown>,
): RenderedTransactionalEmail {
  if (template === "intake.received") {
    return ticketReceivedEmail(data);
  }

  if (template === "quote.sent") {
    return quoteReadyEmail(data);
  }

  if (template === "quote.approved") {
    return quoteApprovedEmail(data);
  }

  if (template === "ticket.ready_for_pickup") {
    return readyForPickupEmail(data);
  }

  if (template === "ticket.delivered") {
    return ticketClosedEmail(data);
  }

  return ticketStatusChangedEmail(data);
}

function ticketReceivedEmail(data: Record<string, unknown>) {
  const ticketNumber = textValue(data.ticketNumber, "tu ticket");
  const customerName = textValue(data.customerName, "Hola");
  const deviceLabel = textValue(data.deviceLabel, "Equipo recibido");
  const portalUrl = textValue(data.portalUrl, "");
  const subject = `Recibimos tu equipo - ${ticketNumber}`;
  const lines = [
    `Hola ${customerName},`,
    `Recibimos tu equipo y creamos el ticket ${ticketNumber}.`,
    `Equipo: ${deviceLabel}`,
    data.reportedIssue ? `Problema reportado: ${textValue(data.reportedIssue, "")}` : undefined,
    data.receivedAt ? `Fecha de ingreso: ${textValue(data.receivedAt, "")}` : undefined,
    portalUrl ? `Puedes consultar el estado de tu reparación aquí: ${portalUrl}` : undefined,
    "Si tienes dudas, contacta al taller indicando tu codigo de ticket.",
  ].filter(Boolean);

  return renderLayout(subject, "Equipo recibido", lines, portalUrl);
}

function quoteReadyEmail(data: Record<string, unknown>) {
  const ticketNumber = textValue(data.ticketNumber, "tu ticket");
  const quoteNumber = textValue(data.quoteNumber, "cotización");
  const totalLabel = moneyText(data.currency, data.total);
  const portalUrl = textValue(data.portalUrl, "");
  const quotePdfUrl = textValue(data.quotePdfUrl, "");
  const subject = `Tu cotización ya está disponible - ${ticketNumber}`;
  const lines = [
    `La cotización ${quoteNumber} ya está disponible para el ticket ${ticketNumber}.`,
    totalLabel ? `Total estimado: ${totalLabel}` : undefined,
    portalUrl ? `Puedes revisar el estado y los detalles aqui: ${portalUrl}` : undefined,
    quotePdfUrl ? `PDF de cotización: ${quotePdfUrl}` : undefined,
    "La aprobación en línea se implementará próximamente. Por ahora, contacta al taller para confirmar.",
  ].filter(Boolean);

  return renderLayout(subject, "Cotización disponible", lines, portalUrl);
}

function quoteApprovedEmail(data: Record<string, unknown>) {
  const ticketNumber = textValue(data.ticketNumber, "tu ticket");
  const portalUrl = textValue(data.portalUrl, "");
  const subject = `Cotización aprobada - ${ticketNumber}`;
  const lines = [
    `La cotización del ticket ${ticketNumber} fue marcada como aprobada.`,
    "El taller continuará con el flujo de reparación.",
    portalUrl ? `Puedes consultar el avance aqui: ${portalUrl}` : undefined,
  ].filter(Boolean);

  return renderLayout(subject, "Cotización aprobada", lines, portalUrl);
}

function readyForPickupEmail(data: Record<string, unknown>) {
  const ticketNumber = textValue(data.ticketNumber, "tu ticket");
  const deviceLabel = textValue(data.deviceLabel, "tu equipo");
  const portalUrl = textValue(data.portalUrl, "");
  const balance = moneyText(data.currency, data.balanceDue);
  const subject = `Tu equipo está listo para entrega - ${ticketNumber}`;
  const lines = [
    `${deviceLabel} está listo para entrega.`,
    `Ticket: ${ticketNumber}`,
    balance ? `Saldo pendiente: ${balance}` : undefined,
    portalUrl ? `Consulta los detalles aqui: ${portalUrl}` : undefined,
    "Contacta al taller antes de pasar a retirar si necesitas coordinar horario.",
  ].filter(Boolean);

  return renderLayout(subject, "Equipo listo para entrega", lines, portalUrl);
}

function ticketClosedEmail(data: Record<string, unknown>) {
  const ticketNumber = textValue(data.ticketNumber, "tu ticket");
  const portalUrl = textValue(data.portalUrl, "");
  const subject = `Ticket cerrado - ${ticketNumber}`;
  const lines = [
    `El ticket ${ticketNumber} fue cerrado como entregado.`,
    "Gracias por confiar en FengzLab.",
    portalUrl ? `Puedes conservar este enlace como referencia: ${portalUrl}` : undefined,
    "Si necesitas soporte futuro, contacta al taller indicando tu codigo de ticket.",
  ].filter(Boolean);

  return renderLayout(subject, "Ticket cerrado", lines, portalUrl);
}

function ticketStatusChangedEmail(data: Record<string, unknown>) {
  const ticketNumber = textValue(data.ticketNumber, "tu ticket");
  const portalUrl = textValue(data.portalUrl, "");
  const status = textValue(data.toStatusLabel, textValue(data.toStatus, "actualizado"));
  const subject = `Actualización de reparación - ${ticketNumber}`;
  const lines = [
    `Tu reparación cambió de estado: ${status}.`,
    `Ticket: ${ticketNumber}`,
    portalUrl ? `Puedes consultar el avance aqui: ${portalUrl}` : undefined,
  ].filter(Boolean);

  return renderLayout(subject, "Estado actualizado", lines, portalUrl);
}

function renderLayout(
  subject: string,
  heading: string,
  lines: (string | undefined)[],
  ctaUrl: string,
): RenderedTransactionalEmail {
  const filteredLines = lines.filter((line): line is string => Boolean(line));
  const text = filteredLines.join("\n");
  const paragraphs = filteredLines
    .map((line) => `<p style="margin:0 0 12px;color:#334155;line-height:1.5;">${escapeHtml(line)}</p>`)
    .join("");
  const cta = ctaUrl
    ? `<a href="${escapeAttribute(ctaUrl)}" style="display:inline-block;margin-top:8px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:600;">Consultar reparación</a>`
    : "";

  return {
    subject,
    text,
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <p style="margin:0 0 8px;color:#64748b;font-size:13px;font-weight:700;">FengzLab</p>
        <h1 style="margin:0 0 18px;color:#111827;font-size:22px;">${escapeHtml(heading)}</h1>
        ${paragraphs}
        ${cta}
      </div>
      <p style="margin:14px 0 0;color:#64748b;font-size:12px;">Mensaje transaccional generado por el sistema interno de FengzLab.</p>
    </div>
  </body>
</html>`,
  };
}

function moneyText(currency: unknown, value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return `${textValue(currency, "CRC")} ${numericValue.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
