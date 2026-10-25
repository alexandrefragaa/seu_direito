import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seu_direito | Conferência eleitoral independente",
  description:
    "Projeto de conferência eleitoral com proveniência dos dados, cobertura explícita e cálculos auditáveis."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
