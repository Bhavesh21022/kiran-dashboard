"use client";

import { motion } from "framer-motion";
import { RiskCategory, riskColor } from "@/lib/thermalIndex";

interface Props {
  score: number; // 0-100
  category: RiskCategory;
  size?: number;
}

export default function ThermalGauge({ score, category, size = 140 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - score / 100);
  const color = riskColor[category];

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 24 }}>
      <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
        <path
          d={`M 8 ${size / 2 + 8} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2 + 8}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.path
          d={`M 8 ${size / 2 + 8} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2 + 8}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <motion.span
          className="font-display text-2xl font-semibold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-[10px] text-white/40">TSI / 100</span>
      </div>
    </div>
  );
}
