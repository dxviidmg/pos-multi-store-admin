import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/auth.context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SVAdmin",
  description: "Panel de administración de SmartVenta (tenants y pagos).",
  applicationName: "SVAdmin",
  appleWebApp: {
    capable: true,
    title: "SVAdmin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#171A4A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
