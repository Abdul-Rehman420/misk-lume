import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | Misk Lume",
  robots: { index: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
