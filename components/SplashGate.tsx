"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AmbientBackground from "./AmbientBackground";

export default function SplashGate({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.06, filter: "blur(6px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-base-bg"
          >
            <AmbientBackground intense />

            {/* radial glow behind the wordmark */}
            <div
              className="absolute h-[420px] w-[420px] rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.22), transparent 70%)" }}
            />

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              className="kiran-shimmer relative z-10 font-display text-7xl font-bold tracking-tight sm:text-8xl"
            >
              KIRAN
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="relative z-10 mt-3 text-xs uppercase tracking-[0.35em] text-white/40 sm:text-sm"
            >
              Heatwave Early Warning System
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="relative z-10 mt-9 h-[2px] w-40 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 via-white to-red-500"
                animate={{ x: ["-100%", "220%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
