
"use client";

import { useLoading } from "@/context/loading-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { isLoading } = useLoading();
  const brandName = "Willow";
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setPercentage(0); // Reset on new load
      const startTime = Date.now();
      const duration = 1200; // ms

      interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(1, elapsedTime / duration);
        setPercentage(Math.floor(progress * 100));

        if (progress >= 1) {
          clearInterval(interval);
          // Keep it at 100 until isLoading is false
          setPercentage(100);
        }
      }, 50); // Update frequency
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        delay: 0.4,
      },
    },
  };

  const textContainerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: [0.6, 0.01, 0.05, 0.95],
        duration: 0.8,
      },
    },
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <motion.h1
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
            className="text-6xl md:text-8xl font-black tracking-tighter text-foreground flex overflow-hidden"
            aria-label={brandName}
          >
            {brandName.split("").map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                variants={letterVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Loading... {percentage}%
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
