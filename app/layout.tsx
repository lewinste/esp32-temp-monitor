import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boiler Monitor",
  description: "Solar boiler temperature monitoring and shower tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">{children}</body>
    </html>
  );
}
