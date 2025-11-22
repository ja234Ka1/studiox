
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
            
             {/* The "liquid fill" implementation which is masked by the text shape */}
             <div className="absolute inset-0 z-10"
                style={{
                    maskImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='8rem' font-weight='900' letter-spacing='0.05em' fill='white'>${brandName}</text></svg>")`,
                    WebkitMaskImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='8rem' font-weight='900' letter-spacing='0.05em' fill='white'>${brandName}</text></svg>")`,
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                }}
             >
                <motion.div 
                    className="w-full h-full bg-accent"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.2, ease: [0.6, 0.01, 0.05, 0.95] }}
                />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
