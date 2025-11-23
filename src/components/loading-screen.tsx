
"use client";

import { useLoading } from "@/context/loading-provider";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const { isLoading, stopLoading } = useLoading();
  const brandName = "Willow";
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!scope.current) return;

    if (isLoading) {
      // Animate to 90% over a longer duration to simulate loading
      animate(
        scope.current,
        { width: "90%" },
        { duration: 10, ease: "easeOut" }
      );
    } else {
      // When loading is finished, quickly animate to 100%
      animate(
        scope.current,
        { width: "100%" },
        { duration: 0.5, ease: "easeOut" }
      );
    }
  }, [isLoading, animate, scope]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        // This is a failsafe in case the stopLoading call in the template doesn't fire
        // for some reason, we ensure the state is correct after animation.
        if (!isLoading) {
          stopLoading();
        }
      }}
    >
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
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
            className="text-center flex flex-col items-center"
          >
            <motion.div 
                className="mb-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0, 0.55, 0.45, 1], delay: 0.2 }}}
            >
                <Image src="https://upload.wikimedia.org/wikipedia/commons/7/7a/A-symmetrical-silhouette-of-a-tree-with-many-branches-and-leaves-cutouts-png.svg" alt="Willow logo" width={80} height={80} className="h-20 w-20 filter-glow" />
            </motion.div>
            <motion.h1
              className="text-6xl md:text-8xl font-black tracking-tighter text-foreground flex overflow-hidden"
              aria-label={brandName}
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.4,
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
                    className="h-full bg-primary"
                    style={{ width: "0%" }}
                />
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
