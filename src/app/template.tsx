
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

  // Ensure loading stops on route change, with a small delay for transition.
  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading();
    }, 100); // Small delay to allow page transition to start

    return () => clearTimeout(timer);
  }, [pathname, stopLoading]);

  if (!animationsEnabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname} // Animate on path change
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
