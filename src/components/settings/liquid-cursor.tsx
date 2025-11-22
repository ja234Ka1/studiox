
"use client";

import { motion } from "framer-motion";

interface LiquidCursorProps {
  x: number;
  y: number;
  isHovering: boolean;
}

export function LiquidCursor({ x, y, isHovering }: LiquidCursorProps) {
  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full bg-accent pointer-events-none z-[9999]"
      style={{
        width: 40,
        height: 40,
        x: x - 20,
        y: y - 20,
        filter: `url(#goo)`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: isHovering ? 1.2 : 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent-foreground rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: isHovering ? 2.5 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      />
    </motion.div>
  );
}
