import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

/** Canonical site URL for absolute og:image / twitter:image (required for WhatsApp, etc.). */
const SITE_FALLBACK = "https://bridgecore.live";

function metadataBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw.replace(/\/$/, ""));
    } catch {
      /* use fallback */
    }
  }
  return new URL(SITE_FALLBACK);
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "Bridgecore",
    template: "%s | Bridgecore",
  },
  description: "Bridgecore – modern trading dashboard experience.",
  applicationName: "Bridgecore",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Bridgecore",
    title: "Bridgecore",
    description: "Bridgecore – modern trading dashboard experience.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridgecore",
    description: "Bridgecore – modern trading dashboard experience.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen w-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

