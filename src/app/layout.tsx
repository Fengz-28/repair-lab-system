import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepairLab | Sistema operativo del taller",
  description:
    "RepairLab es el sistema operativo interno para recepción, diagnóstico, cotizaciones, facturas, pagos, inventario y seguimiento profesional de reparaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030303] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
