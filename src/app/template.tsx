
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-provider";

export default function Template({ children }: { children: React.ReactNode }) {
  const { animationsEnabled } = useTheme();

  if (!animationsEnabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
