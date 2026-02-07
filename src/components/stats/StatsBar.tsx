"use client";

import { useEffect, useState } from "react";
import { PRESSURE_LABELS } from "@/lib/types";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";

interface StatsBarProps {
  total: number;
  topPressure: string;
  topPressurePct: number;
  avgChange: number;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useMotionValueEvent(spring, "change", (v) => {
    setDisplay(Number(v.toFixed(decimals)));
  });

  return <>{display}</>;
}

export function StatsBar({
  total,
  topPressure,
  topPressurePct,
  avgChange,
}: StatsBarProps) {
  return (
    <motion.div
      className="glass-card flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl px-5 py-3 text-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <span className="font-semibold text-accent">
        <AnimatedNumber value={total} /> {total === 1 ? "voice" : "voices"}
      </span>
      <span className="text-muted" aria-hidden="true">&middot;</span>
      <span className="text-muted">
        Top concern: {PRESSURE_LABELS[topPressure] ?? topPressure} (
        <AnimatedNumber value={topPressurePct} />%)
      </span>
      <span className="text-muted" aria-hidden="true">&middot;</span>
      <span className="text-muted">
        Avg change: <span className="font-mono text-foreground"><AnimatedNumber value={avgChange} decimals={1} />/5</span>
      </span>
    </motion.div>
  );
}
