
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

  const waveVariants = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        delay: 0.2,
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

            {/* Foreground text (solid) that acts as a MASK */}
            <h1
              className="absolute inset-0 text-6xl md:text-8xl font-black tracking-widest text-foreground"
              style={{
                clipPath: "url(#liquid-mask)",
                WebkitClipPath: "url(#liquid-mask)",
              }}
              aria-label={brandName}
            >
              {brandName}
            </h1>
            
            {/* The SVG mask definition, which contains the animating wave */}
            <svg style={{ width: 0, height: 0, position: "absolute" }}>
              <defs>
                <clipPath id="liquid-mask">
                  <motion.path
                    initial={{
                      d: "M0,200 Q200,200 400,200 L400,200 L0,200 Z"
                    }}
                    animate={{
                      d: "M0,100 Q200,50 400,100 L400,200 L0,200 Z"
                    }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  />
                </clipPath>
              </defs>
            </svg>
            
             {/* The new "liquid fill" implementation */}
             <div className="absolute inset-0 z-10"
                style={{
                    maskImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='8rem' font-weight='900' letter-spacing='0.05em' fill='white'>${brandName}</text></svg>")`,
                    maskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
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

    