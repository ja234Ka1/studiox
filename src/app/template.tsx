
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-provider";
import { useLoading } from "@/context/loading-provider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const { animationsEnabled } = useTheme();
  const { stopLoading } = useLoading();
  const pathname = usePathname();

  // This effect will run whenever the page (and thus the template) changes.
  // It's responsible for turning OFF the loading screen.
  useEffect(() => {
    stopLoading();
  }, [pathname, stopLoading]);

  if (!animationsEnabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname} // Animate on path change
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
