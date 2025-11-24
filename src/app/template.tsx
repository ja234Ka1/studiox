
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-provider";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loading-provider";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const { animationsEnabled } = useTheme();
  const { stopLoading } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    // Force stop any previous loading animations on new page template mount.
    // This prevents stuck loaders on rapid navigation.
    stopLoading(true);
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
      // The loading screen's onExitComplete will handle the final stop call
    >
      {children}
    </motion.div>
  );
}
