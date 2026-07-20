import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import Preloader from "@/components/ui/Preloader";
import { CartProvider } from "@/lib/context/CartContext";
import { OrganizationJsonLd } from "@/components/ui/JsonLd";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://misklume.com"),
  title: "Misk Lume - Luxury Perfumes & Attars",
  description:
    "Discover exquisite fragrances crafted with rare ingredients from around the world. Shop luxury perfumes, attars, and gift sets.",
  openGraph: {
    title: "Misk Lume - Luxury Perfumes & Attars",
    description: "Discover exquisite fragrances crafted with rare ingredients from around the world.",
    url: "https://misklume.com",
    siteName: "Misk Lume",
    locale: "en_PK",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Misk Lume - Luxury Perfumes & Attars",
    description: "Discover exquisite fragrances crafted with rare ingredients from around the world.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OrganizationJsonLd />
        <Preloader />
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
