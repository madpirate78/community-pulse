import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { config } from "@/config";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { MotionProvider } from "@/components/ui/MotionProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: config.branding.appName,
    template: `%s | ${config.branding.appName}`,
  },
  description: config.branding.metaDescription,
  openGraph: {
    title: config.branding.appName,
    description: config.branding.ogDescription,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-body antialiased`}
      >
        <nav className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-accent">
              {config.branding.appName}
            </Link>
            <div className="flex gap-5 text-sm font-medium">
              <Link
                href="/submit"
                className="relative text-muted transition-colors hover:text-foreground"
              >
                Submit
              </Link>
              <Link
                href="/statistics"
                className="relative text-muted transition-colors hover:text-foreground"
              >
                Statistics
              </Link>
              <Link
                href="/insights"
                className="relative text-muted transition-colors hover:text-foreground"
              >
                Insights
              </Link>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] opacity-30" />
        </nav>
        <GrainOverlay />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
