"use client";

import { useState, useEffect } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 250);
    const unmount = setTimeout(() => setVisible(false), 450);
    return () => { clearTimeout(timer); clearTimeout(unmount); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-primary transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-0">
        <span className="font-display text-3xl font-semibold text-text-primary">Misk</span>
        <span className="font-display text-3xl font-semibold text-accent-gold">Lume</span>
      </div>
      <div className="mt-6 h-[2px] w-[120px] overflow-hidden rounded-full bg-border-subtle">
        <div
          className="h-full bg-accent-gold"
          style={{
            animation: "preloaderBar 1.5s ease-in-out forwards",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes preloaderBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
