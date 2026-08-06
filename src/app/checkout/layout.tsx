import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Misk Lume",
  robots: { index: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
