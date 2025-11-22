
"use client";

import { useLoading } from "@/context/loading-provider";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoadingScreen() {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="flex flex-col items-center gap-2"
          >
            <Clapperboard className="h-12 w-12 text-accent" />
            <span className="text-lg font-bold sm:inline-block">Willow</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
