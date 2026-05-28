export type KeyboardShortcutDefinition = {
  id: string;
  label: string;
  description: string;
  keys: string[];
  href?: string;
  action?: "open-command-palette";
};

export const KEYBOARD_SEQUENCE_TIMEOUT_MS = 1000;

export const keyboardShortcuts: KeyboardShortcutDefinition[] = [
  {
    id: "go-dashboard",
    label: "Ir al panel",
    description: "Abrir el resumen operativo.",
    keys: ["g", "d"],
    href: "/admin/dashboard",
  },
  {
    id: "go-tickets",
    label: "Ir a tickets",
    description: "Abrir lista de tickets.",
    keys: ["g", "t"],
    href: "/admin/tickets",
  },
  {
    id: "go-customers",
    label: "Ir a clientes",
    description: "Abrir CRM de clientes.",
    keys: ["g", "c"],
    href: "/admin/customers",
  },
  {
    id: "go-messages",
    label: "Ir a mensajes",
    description: "Abrir centro de mensajes.",
    keys: ["g", "m"],
    href: "/admin/messages",
  },
  {
    id: "go-catalog",
    label: "Ir al catálogo",
    description: "Abrir catálogo e inventario.",
    keys: ["g", "a"],
    href: "/admin/catalog",
  },
  {
    id: "open-command-palette",
    label: "Abrir paleta de comandos",
    description: "Buscar comandos, tickets, clientes y mensajes.",
    keys: ["/"],
    action: "open-command-palette",
  },
];

export function shortcutDisplay(keys: string[]) {
  return keys.join(" luego ");
}
