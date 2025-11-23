
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNotification } from '@/context/notification-provider';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/lib/utils';
import { CheckCircle2, Info } from 'lucide-react';

export function WatchlistNotification() {
  const { notification } = useNotification();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[100] w-full max-w-sm"
        >
          <div className="flex items-center gap-4 rounded-lg bg-card/80 p-3 shadow-2xl backdrop-blur-lg border border-primary/20">
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={getTmdbImageUrl(notification.item.poster_path, 'w500')}
                alt={notification.item.title || notification.item.name || ''}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <p className="text-xs text-muted-foreground">
                {notification.type === 'exists' ? "Already in Watchlist" : "Added to Watchlist"}
              </p>
              <p className="font-semibold leading-tight">
                {notification.item.title || notification.item.name}
              </p>
            </div>
            {notification.type === 'exists' ? (
              <Info className="h-7 w-7 flex-shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-7 w-7 flex-shrink-0 text-primary" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
