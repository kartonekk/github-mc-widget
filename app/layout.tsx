import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "github-mc-widget — Modrinth & CurseForge download badges",
  description: "Generate SVG download-count badges for your Minecraft project, linked to Modrinth and CurseForge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
