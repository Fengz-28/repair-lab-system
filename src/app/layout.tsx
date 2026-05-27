import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repair Lab System",
  description: "Repair management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030303] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
