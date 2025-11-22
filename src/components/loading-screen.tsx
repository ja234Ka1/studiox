
"use client";

import { useLoading } from "@/context/loading-provider";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen() {
  const { isLoading } = useLoading();
  const brandName = "Willow";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        delay: 0.5,
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="relative">
            {/* Background text (semi-transparent) */}
            <h1
              className="text-6xl md:text-8xl font-black tracking-widest text-foreground/20"
              aria-hidden="true"
            >
              {brandName}
            </h1>
            
            {/* The SVG mask definition, which contains the animating wave */}
            <svg style={{ width: 0, height: 0, position: "absolute" }}>
              <defs>
                <clipPath id="liquid-mask" clipPathUnits="objectBoundingBox">
                  <motion.path
                    initial={{
                      d: "M 0,1 C 0.3,1 0.7,1 1,1 V 1 H 0 Z"
                    }}
                    animate={{
                      d: "M 0,0.1 C 0.3,0 0.7,0.2 1,0.1 V 1 H 0 Z"
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  />
                </clipPath>
              </defs>
            </svg>

            {/* The "liquid fill" implementation */}
            <div className="absolute inset-0" style={{ clipPath: "url(#liquid-mask)" }}>
                <motion.h1 
                    className="text-6xl md:text-8xl font-black tracking-widest text-accent"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.2, ease: [0.6, 0.01, 0.05, 0.95] }}
                >
                  {brandName}
                </motion.h1>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
