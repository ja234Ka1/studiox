
"use client";

import { useLoading } from "@/context/loading-provider";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { isLoading } = useLoading();
  const brandName = "Willow";
  const [scope, animate] = useAnimate();
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!scope.current) return;

    if (isLoading) {
      animate(
        scope.current,
        { width: "90%" },
        { duration: 10, ease: "easeOut" }
      );
    } else {
      animate(
        scope.current,
        { width: "100%" },
        { duration: 0.5, ease: "easeOut" }
      );
    }
  }, [isLoading, animate, scope]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.4,
              ease: "easeInOut",
              delay: 0.5,
            },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
            className="text-center"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-black tracking-tighter text-foreground flex overflow-hidden"
              aria-label={brandName}
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.2,
                  },
                },
              }}
            >
              {brandName.split("").map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  className="inline-block"
                  variants={{
                    hidden: { y: "110%", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        ease: [0.2, 1, 0.3, 1],
                        duration: 1,
                      },
                    },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
            
            <div className="relative mt-6 h-1 w-48 mx-auto overflow-hidden rounded-full bg-muted">
                <motion.div 
                    ref={scope}
                    className="h-full bg-accent"
                    style={{ width: "0%" }}
                    onUpdate={latest => {
                        const widthPercentage = parseFloat(latest.width);
                        setPercentage(Math.round(widthPercentage));
                    }}
                />
            </div>
            
            <motion.div
              className="mt-4 text-sm tabular-nums text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Loading... {percentage}%
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
