import { RepairPanel, RepairNavbar, RepairTopbar } from "@/components/repairlab";
import { getCurrentStaffSession } from "@/server/auth/local-admin";

const adminLinks = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/intake", label: "Nueva recepcion" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/messages", label: "Mensajes" },
  { href: "/admin/catalog", label: "Catalogo" },
];

export async function AdminNav() {
  const session = await getCurrentStaffSession();

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <RepairTopbar />
      <RepairNavbar
        links={adminLinks}
        user={
          session
            ? {
                name: session.name ?? session.email,
                role: roleLabel(session.role),
              }
            : null
        }
      />
    </div>
  );
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: "Admin",
    TECHNICIAN: "Tecnico",
    RECEPTIONIST: "Recepcion",
  };

  return labels[role] ?? role;
}

export function DemoChecklist() {
  const steps = [
    "Crear una recepcion.",
    "Abrir el ticket.",
    "Pasar a diagnostico.",
    "Crear cotizacion.",
    "Agregar linea.",
    "Enviar y aprobar cotizacion.",
    "Generar factura.",
    "Registrar pago.",
    "Revisar inventario/dashboard.",
    "Descargar PDFs.",
  ];

  return (
    <RepairPanel>
      <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">
        Flujo sugerido para probar
      </h2>
      <ol className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step} className="flex min-w-0 gap-2">
            <span className="font-medium text-zinc-950 dark:text-zinc-50">{index + 1}.</span>
            <span className="break-words">{step}</span>
          </li>
        ))}
      </ol>
    </RepairPanel>
  );
}
