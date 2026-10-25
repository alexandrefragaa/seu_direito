import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Seu Direito | Apuração eleitoral ao vivo",
  description: "Painel independente para acompanhar resultados eleitorais oficiais do TSE, por Brasil, estado, município e exterior."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
