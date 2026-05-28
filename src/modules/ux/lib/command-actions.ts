export type CommandPaletteAction = {
  id: string;
  label: string;
  description: string;
  href?: string;
  keywords: string[];
  disabled?: boolean;
};

export const commandPaletteActions: CommandPaletteAction[] = [
  {
    id: "dashboard",
    label: "Ir al panel",
    description: "Resumen operativo del taller.",
    href: "/admin/dashboard",
    keywords: ["dashboard", "panel", "resumen", "operación"],
  },
  {
    id: "tickets",
    label: "Ir a tickets",
    description: "Buscar y abrir reparaciones.",
    href: "/admin/tickets",
    keywords: ["tickets", "reparaciones", "órdenes", "casos"],
  },
  {
    id: "customers",
    label: "Ir a clientes",
    description: "CRM, historial de clientes y saldos.",
    href: "/admin/customers",
    keywords: ["clientes", "customers", "crm", "historial"],
  },
  {
    id: "messages",
    label: "Ir a mensajes",
    description: "Historial de correos y notificaciones.",
    href: "/admin/messages",
    keywords: ["mensajes", "messages", "correos", "emails", "notificaciones"],
  },
  {
    id: "catalog",
    label: "Ir al catálogo",
    description: "Servicios, productos, repuestos e inventario.",
    href: "/admin/catalog",
    keywords: ["catálogo", "catalogo", "inventario", "stock", "repuestos"],
  },
  {
    id: "create-ticket",
    label: "Registrar recepción",
    description: "Crear una nueva recepción para generar un ticket.",
    href: "/admin/intake",
    keywords: ["crear", "ticket", "recepción", "recepcion", "intake", "nuevo"],
  },
  {
    id: "search-tickets",
    label: "Buscar tickets",
    description: "La búsqueda global de tickets se implementará en una fase futura.",
    keywords: ["buscar", "global", "search", "tickets"],
    disabled: true,
  },
];

export function filterCommandActions(query: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return commandPaletteActions;
  }

  return commandPaletteActions.filter((action) => {
    const searchable = [
      action.label,
      action.description,
      ...action.keywords,
    ]
      .map(normalizeQuery)
      .join(" ");

    return searchable.includes(normalizedQuery);
  });
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}
