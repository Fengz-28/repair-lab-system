import type { CommunicationChannel, MessageStatus } from "@prisma/client";

export function messageStatusLabel(status: MessageStatus, provider?: string | null) {
  if (provider === "console" && status === "SENT") {
    return "Vista previa";
  }

  if (provider === "disabled" && status === "DRAFT") {
    return "Deshabilitado";
  }

  const labels: Record<MessageStatus, string> = {
    DRAFT: "Borrador",
    QUEUED: "Pendiente",
    SENT: "Enviado",
    DELIVERED: "Entregado",
    FAILED: "Fallido",
    RECEIVED: "Recibido",
  };

  return labels[status] ?? status;
}

export function messageStatusTone(status: MessageStatus, provider?: string | null) {
  if (status === "FAILED") {
    return "danger";
  }

  if (provider === "console") {
    return "info";
  }

  if (provider === "disabled" || status === "DRAFT" || status === "QUEUED") {
    return "muted";
  }

  return "success";
}

export function channelLabel(channel: CommunicationChannel) {
  const labels: Record<CommunicationChannel, string> = {
    EMAIL: "Email",
    SMS: "SMS",
    WHATSAPP: "WhatsApp",
    PHONE: "Telefono",
    INTERNAL: "Interno",
    SYSTEM: "Sistema",
  };

  return labels[channel] ?? channel;
}

export function providerLabel(provider?: string | null) {
  if (!provider) {
    return "Sin proveedor";
  }

  const labels: Record<string, string> = {
    console: "Vista previa",
    resend: "Resend",
    disabled: "Deshabilitado",
  };

  return labels[provider] ?? provider;
}

export function templateLabel(template?: string | null) {
  const labels: Record<string, string> = {
    "intake.received": "Ticket recibido",
    "ticket.status_changed": "Cambio de estado",
    "quote.sent": "Cotizacion lista",
    "quote.approved": "Cotizacion aprobada",
    "ticket.ready_for_pickup": "Equipo listo",
    "ticket.delivered": "Ticket cerrado",
  };

  return template ? labels[template] ?? template : "Sin tipo";
}
