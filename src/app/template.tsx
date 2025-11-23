
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

  // On any path change, stop the loading animation.
  // This effect runs when the new page's template is mounted.
  useEffect(() => {
    // A small delay ensures that the page has had a moment to begin rendering
    // before the loading screen is hidden.
    const timer = setTimeout(() => {
      stopLoading();
    }, 100); 

    return () => clearTimeout(timer);
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
