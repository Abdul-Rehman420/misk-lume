"use client";

import { ReactNode } from "react";
import StaggerChildren from "@/components/animations/StaggerChildren";

export default function ShopProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <StaggerChildren eager className={className}>{children}</StaggerChildren>;
}
