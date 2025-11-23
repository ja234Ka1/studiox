
'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-provider';

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { animationsEnabled } = useTheme();

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const buttonContent = (
    <Button
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
      className="rounded-full h-12 w-12 shadow-lg"
    >
      <ArrowUp className="h-6 w-6" />
      <span className="sr-only">Go to top</span>
    </Button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isVisible &&
          (animationsEnabled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {buttonContent}
            </motion.div>
          ) : (
            buttonContent
          ))}
      </AnimatePresence>
    </div>
  );
}
