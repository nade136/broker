import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Bridgecore",
    template: "%s | Bridgecore",
  },
  description:
    "Bridgecore – modern trading dashboard experience.",
  openGraph: {
    type: "website",
    locale: "en",
    siteName: "Bridgecore",
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

