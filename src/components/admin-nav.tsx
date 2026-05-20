import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/intake", label: "Nueva recepcion" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/catalog", label: "Catalogo" },
];

export function AdminNav() {
  return (
    <nav className="rounded border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap gap-2">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            className="rounded px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
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
    <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
        Flujo sugerido para probar
      </h2>
      <ol className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-2">
            <span className="font-medium text-zinc-950 dark:text-zinc-50">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
