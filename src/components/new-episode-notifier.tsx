
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Tv } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-provider';
import type { Media, MediaDetails } from '@/types/tmdb';
import { getMediaDetails } from '@/lib/tmdb';
import { getTmdbImageUrl } from '@/lib/utils';
import { Button } from './ui/button';
import LoadingLink from './loading-link';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface TvShowWatchData {
  id: number;
  lastKnownEpisodeCount: number;
}

interface NewEpisodeNotification {
  item: MediaDetails;
  newEpisodeCount: number;
}

const NOTIFIED_KEY_PREFIX = 'willow-notified-episode-';
const WATCH_DATA_KEY = 'willow-tv-watch-data';

export function NewEpisodeNotifier() {
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const [notifications, setNotifications] = useState<NewEpisodeNotification[]>([]);
  const [tvWatchData, setTvWatchData] = useLocalStorage<TvShowWatchData[]>(WATCH_DATA_KEY, []);

  useEffect(() => {
    if (isWatchlistLoading || watchlist.length === 0) {
      return;
    }

    const checkShowsForNewEpisodes = async () => {
      const showsOnWatchlist = watchlist.filter(item => item.media_type === 'tv');
      const newNotifications: NewEpisodeNotification[] = [];

      for (const show of showsOnWatchlist) {
        // Skip if we've already notified for this show's current episode count
        const notifiedKey = `${NOTIFIED_KEY_PREFIX}${show.id}`;
        const previouslyNotifiedCount = sessionStorage.getItem(notifiedKey);
        
        const watchData = tvWatchData.find(d => d.id === show.id);
        const lastKnownEpisodeCount = watchData?.lastKnownEpisodeCount || 0;

        if (previouslyNotifiedCount && parseInt(previouslyNotifiedCount, 10) >= (show as MediaDetails).number_of_episodes) {
            continue;
        }

        try {
          const details = await getMediaDetails(show.id, 'tv');
          const currentEpisodeCount = details.number_of_episodes || 0;
          
          if (currentEpisodeCount > 0 && lastKnownEpisodeCount > 0 && currentEpisodeCount > lastKnownEpisodeCount) {
             newNotifications.push({ item: details, newEpisodeCount: currentEpisodeCount - lastKnownEpisodeCount });
             sessionStorage.setItem(notifiedKey, String(currentEpisodeCount));
          }

          // Update our local watch data with the latest count regardless
          setTvWatchData(prev => {
            const existing = prev.find(d => d.id === show.id);
            if (existing) {
              return prev.map(d => d.id === show.id ? { ...d, lastKnownEpisodeCount: currentEpisodeCount } : d);
            }
            return [...prev, { id: show.id, lastKnownEpisodeCount: currentEpisodeCount }];
          });

        } catch (error) {
          console.error(`Failed to check for new episodes for show ID ${show.id}`, error);
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
    };

    checkShowsForNewEpisodes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWatchlistLoading, watchlist]); // Only run when watchlist loads

  const dismissNotification = (showId: number) => {
    setNotifications(prev => prev.filter(n => n.item.id !== showId));
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] w-full max-w-sm space-y-3">
        <AnimatePresence>
        {notifications.map((notification, index) => (
            <motion.div
            key={notification.item.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.2 } }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
            <div className="flex items-start gap-3 rounded-lg bg-card/80 p-3 pr-2 shadow-2xl backdrop-blur-lg border border-primary/20">
                <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                        src={getTmdbImageUrl(notification.item.poster_path, 'w500')}
                        alt={notification.item.title || notification.item.name || ''}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-grow pt-1">
                <p className="text-xs text-primary flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5" />
                    New Episode Available
                </p>
                <p className="font-semibold leading-tight mt-1">
                    {notification.item.name}
                </p>
                <Button size="sm" asChild className="mt-2 h-7 px-2">
                    <LoadingLink href={`/media/tv/${notification.item.id}`}>
                        Watch Now
                    </LoadingLink>
                </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => dismissNotification(notification.item.id)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
            </motion.div>
        ))}
        </AnimatePresence>
    </div>
  );
}
