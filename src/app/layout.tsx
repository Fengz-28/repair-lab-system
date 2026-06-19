import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FengzLab | Taller de reparacion electronica",
  description:
    "FengzLab es un taller de reparacion electronica con diagnostico, cotizacion, seguimiento y entrega documentada para clientes que buscan un servicio tecnico confiable.",
  openGraph: {
    title: "FengzLab | Taller de reparacion electronica",
    description:
      "Diagnostico, cotizacion, reparacion y seguimiento profesional para equipos electronicos.",
    siteName: "FengzLab",
    type: "website",
  },
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
