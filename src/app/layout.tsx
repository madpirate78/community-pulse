import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

const dmSans = DM_Sans({
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
    default: "Community Pulse",
    template: "%s | Community Pulse",
  },
  description:
    "Anonymous community feedback on the cost of living, powered by AI-generated insights.",
  openGraph: {
    title: "Community Pulse",
    description:
      "Share your experience anonymously. AI turns individual voices into a collective picture.",
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
        className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body antialiased`}
      >
        <nav className="sticky top-0 z-40 border-b border-border bg-parchment/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-accent">
              Community Pulse
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
        </nav>
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
