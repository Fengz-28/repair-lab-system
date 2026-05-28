export type QuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  shortcut?: string;
};

const baseQuickActions: QuickAction[] = [
  {
    id: "view-dashboard",
    label: "Ver panel operativo",
    description: "Resumen operativo del taller.",
    href: "/admin/dashboard",
    shortcut: "g luego d",
  },
  {
    id: "open-tickets",
    label: "Abrir tickets",
    description: "Buscar y dar seguimiento a reparaciones.",
    href: "/admin/tickets",
    shortcut: "g luego t",
  },
  {
    id: "open-customers",
    label: "Abrir clientes",
    description: "Abrir CRM e historial de clientes.",
    href: "/admin/customers",
    shortcut: "g luego c",
  },
  {
    id: "open-messages",
    label: "Abrir mensajes",
    description: "Revisar correos y notificaciones generadas.",
    href: "/admin/messages",
    shortcut: "g luego m",
  },
  {
    id: "open-catalog",
    label: "Abrir catálogo",
    description: "Abrir catálogo, repuestos e inventario.",
    href: "/admin/catalog",
    shortcut: "g luego a",
  },
  {
    id: "open-intake",
    label: "Abrir recepción",
    description: "Crear una nueva recepción.",
    href: "/admin/intake",
  },
];

export function getQuickActions(pathname: string): QuickAction[] {
  const actions = [...baseQuickActions];
  const ticketId = currentTicketId(pathname);
  const invoiceContext = currentInvoiceContext(pathname);

  if (ticketId) {
    actions.unshift({
      id: "current-ticket-quotes",
      label: "Abrir cotizaciones del ticket",
      description: "Abrir cotizaciones del ticket actual.",
      href: `/admin/tickets/${ticketId}/quotes`,
    });
  }

  if (invoiceContext) {
    actions.unshift({
      id: "back-current-ticket",
      label: "Volver al detalle del ticket",
      description: "Volver al centro operativo del ticket.",
      href: `/admin/tickets/${invoiceContext.ticketId}`,
    });
    actions.unshift({
      id: "current-ticket-invoice",
      label: "Abrir factura del ticket",
      description: "Abrir la factura actual del ticket.",
      href: `/admin/tickets/${invoiceContext.ticketId}/invoices/${invoiceContext.invoiceId}`,
    });
  } else if (ticketId && pathname.endsWith("/quotes")) {
    actions.unshift({
      id: "back-current-ticket",
      label: "Volver al detalle del ticket",
      description: "Volver al centro operativo del ticket.",
      href: `/admin/tickets/${ticketId}`,
    });
  }

  return dedupeByHref(actions);
}

function currentTicketId(pathname: string) {
  const match = pathname.match(/^\/admin\/tickets\/([^/]+)/);
  return match?.[1] ?? null;
}

function currentInvoiceContext(pathname: string) {
  const match = pathname.match(/^\/admin\/tickets\/([^/]+)\/invoices\/([^/]+)/);

  if (!match?.[1] || !match[2]) {
    return null;
  }

  return {
    ticketId: match[1],
    invoiceId: match[2],
  };
}

function dedupeByHref(actions: QuickAction[]) {
  const seen = new Set<string>();

  return actions.filter((action) => {
    if (seen.has(action.href)) {
      return false;
    }

    seen.add(action.href);
    return true;
  });
}
