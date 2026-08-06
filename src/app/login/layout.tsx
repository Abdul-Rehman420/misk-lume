import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Misk Lume",
  robots: { index: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
