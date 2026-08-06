"use client";

import { ReactNode, Children } from "react";
import { motion } from "framer-motion";

interface StaggerChildrenProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
  eager?: boolean;
}

export default function StaggerChildren({
  children,
  stagger = 0.1,
  className = "",
  eager = false,
}: StaggerChildrenProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(eager
        ? { animate: "show" as const }
        : { whileInView: "show" as const })}
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
