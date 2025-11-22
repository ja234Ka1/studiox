
"use client";

import { useLoading } from "@/context/loading-provider";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen() {
  const { isLoading } = useLoading();
  const brandName = "Willow";
  const letters = brandName.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  const lineVariants = {
    hidden: { width: 0 },
    visible: {
        width: '100%',
        transition: {
            duration: 1.2,
            ease: [0.6, 0.01, -0.05, 0.95],
            delay: 0.5
        }
    }
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="flex overflow-hidden text-4xl font-bold tracking-widest"
              aria-label={brandName}
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
            <div className="w-48 h-0.5 bg-muted overflow-hidden">
                <motion.div 
                    className="h-full bg-accent"
                    variants={lineVariants}
                />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
