import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              Community Pulse
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/submit"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Submit
              </Link>
              <Link
                href="/statistics"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Statistics
              </Link>
              <Link
                href="/insights"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Insights
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
