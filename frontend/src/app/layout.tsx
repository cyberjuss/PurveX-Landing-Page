import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Geist, Space_Grotesk } from "next/font/google";
import RootClientLayout from "./root-client";

const defaultTitle = "PurveX";
const defaultDescription =
  "PurveX helps organizations strengthen their security operations and develop the cybersecurity talent needed to support them.";

export const metadata: Metadata = {
  metadataBase: new URL("https://purvex.com"),
  title: { default: defaultTitle, template: "%s | PurveX" },
  description: defaultDescription,
  icons: {
    icon: [
      { url: "/purvex-favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    shortcut: "/purvex-favicon.svg",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "PurveX",
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "PurveX" }],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/logo.png"],
  },
};

const inter = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/purvex-favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png?v=6" />
        <link rel="shortcut icon" href="/purvex-favicon.svg" />
        {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
      </head>
      <body className={`${inter.className} text-foreground`} suppressHydrationWarning>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
