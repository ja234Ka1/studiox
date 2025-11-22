
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
    // Ensure the element is mounted before trying to animate it
    if (!scope.current) return;

    if (isLoading) {
      // Start loading: animate to 90% and hold
      animate(scope.current, { value: 90 }, { duration: 10, ease: "easeOut" });
    } else {
      // Finish loading: animate from current value to 100%
      animate(scope.current, { value: 100 }, { duration: 0.5, ease: "easeOut" });
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
              duration: 0.3,
              ease: "easeInOut",
              delay: 0.4,
            },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                    delayChildren: 0.1,
                  },
                },
              }}
            >
              {brandName.split("").map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  className="inline-block"
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        ease: [0.6, 0.01, 0.05, 0.95],
                        duration: 0.8,
                      },
                    },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.div
              className="mt-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Loading...{" "}
              <motion.span
                ref={scope}
                onUpdate={(latest) => {
                  setPercentage(Math.round(latest.value));
                }}
              >
                {percentage}
              </motion.span>
              %
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
