import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutti Frutti Online",
  description: "Juego Tutti Frutti multijugador privado en tiempo real con amigos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
