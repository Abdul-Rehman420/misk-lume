"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

const StaggerChildren = dynamic(() => import("@/components/animations/StaggerChildren"), { ssr: false });

export default function ShopProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <StaggerChildren className={className}>{children}</StaggerChildren>;
}
