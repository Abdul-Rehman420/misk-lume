import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import Preloader from "@/components/ui/Preloader";
import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import { OrganizationJsonLd } from "@/components/ui/JsonLd";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { cloudinaryUrl } from "@/lib/images";

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
    images: [{ url: cloudinaryUrl("https://images.unsplash.com/photo-1615634260169-c994b9a33e3e", 1200), width: 1200, height: 630 }],
  },
  icons: {
    icon: cloudinaryUrl("https://images.unsplash.com/photo-1588405748880-12d1d2a59f75", 192),
    apple: cloudinaryUrl("https://images.unsplash.com/photo-1588405748880-12d1d2a59f75", 180),
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
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OrganizationJsonLd />
        <Preloader />
        <AnalyticsTracker />
        <CartProvider>
          <WishlistProvider>
            <SiteShell>{children}</SiteShell>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
