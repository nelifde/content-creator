import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading-display",
});

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen font-sans antialiased`}
      style={{
        fontFamily: "var(--font-sans-body), system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
