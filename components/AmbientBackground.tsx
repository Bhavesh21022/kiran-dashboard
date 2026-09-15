"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Ember {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const EMBER_COLORS = ["#F59E0B", "#FB6D3A", "#EF4444", "#2DD4BF"];

export default function AmbientBackground({ intense = false }: { intense?: boolean }) {
  const [embers, setEmbers] = useState<Ember[]>([]);

  // Generated client-side only (after mount) so server/client markup matches on hydration.
  useEffect(() => {
    const count = intense ? 26 : 12;
    setEmbers(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        duration: 7 + Math.random() * 9,
        delay: Math.random() * 6,
        color: EMBER_COLORS[i % EMBER_COLORS.length],
      }))
    );
  }, [intense]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className={`kiran-grid absolute inset-0 ${intense ? "opacity-[0.14]" : "opacity-[0.05]"}`} />

      <motion.div
        className="absolute inset-x-0 h-52"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(251,109,58,0.10), transparent)",
        }}
        animate={{ y: ["-15%", "115%"] }}
        transition={{ duration: intense ? 5.5 : 10, repeat: Infinity, ease: "linear" }}
      />

      {embers.map((e) => (
        <motion.span
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: `${e.left}%`,
            bottom: -12,
            width: e.size,
            height: e.size,
            backgroundColor: e.color,
            boxShadow: `0 0 6px ${e.color}`,
          }}
          animate={{ y: ["0vh", "-105vh"], opacity: [0, 0.85, 0] }}
          transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
