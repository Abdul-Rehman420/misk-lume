import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Misk Lume",
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
