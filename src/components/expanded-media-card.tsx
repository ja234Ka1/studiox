
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Plus, Check, ChevronDown, Star } from 'lucide-react';
import { getTmdbImageUrl } from '@/lib/utils';
import type { Media } from '@/types/tmdb';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '@/lib/userData';

interface ExpandedMediaCardProps {
  item: Media;
  anchorElement: HTMLElement;
  onClose: () => void;
}

export function ExpandedMediaCard({ item, anchorElement, onClose }: ExpandedMediaCardProps) {
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const backdropUrl = getTmdbImageUrl(item.backdrop_path, 'w500');
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;
  const year = item.release_date || item.first_air_date ? new Date(item.release_date! || item.first_air_date!).getFullYear() : 'N/A';
  
  useEffect(() => {
    const watchlist = getWatchlist();
    setIsInWatchlist(watchlist.some(watchlistItem => watchlistItem.id === item.id));

    const handleWatchlistChange = () => {
      const updatedWatchlist = getWatchlist();
      setIsInWatchlist(updatedWatchlist.some(watchlistItem => watchlistItem.id === item.id));
    };

    window.addEventListener('willow-watchlist-change', handleWatchlistChange);
    return () => window.removeEventListener('willow-watchlist-change', handleWatchlistChange);
  }, [item.id]);
  
  useEffect(() => {
    const updatePosition = () => {
      if (anchorElement) {
        const rect = anchorElement.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [anchorElement]);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isInWatchlist) {
      removeFromWatchlist(item.id);
      toast({ title: `Removed from Watchlist`, description: `"${title}" has been removed.` });
    } else {
      addToWatchlist(item);
      toast({ title: 'Added to Watchlist', description: `"${title}" has been added.` });
    }
  };

  if (!position.width) return null;

  const expandedWidth = position.width * 1.5;
  const expandedHeight = expandedWidth * (9 / 16);
  const detailsHeight = 130;
  const totalHeight = expandedHeight + detailsHeight;

  return (
    <div
      className="fixed inset-0 z-40"
      onMouseLeave={onClose}
    >
      <motion.div
        layoutId={`card-container-${item.id}`}
        className="absolute z-50 bg-card rounded-lg shadow-2xl overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
        }}
        initial={{
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
        }}
        animate={{
          top: position.top - (totalHeight - position.height) / 2,
          left: position.left - (expandedWidth - position.width) / 2,
          width: expandedWidth,
          height: totalHeight,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div 
          className="w-full h-full flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
        >
          <div className="relative w-full" style={{ height: `${expandedHeight}px` }}>
            <Image
              src={backdropUrl}
              alt={title || "Media backdrop"}
              fill
              className="object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
          <div className="p-3 flex-grow" style={{ height: `${detailsHeight}px` }}>
             <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Button size="icon" className="h-8 w-8 rounded-full" asChild>
                  <Link href={detailPath} onClick={(e) => e.stopPropagation()}>
                    <PlayCircle className="w-4 h-4 fill-current" />
                  </Link>
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={handleWatchlistToggle}>
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" asChild>
                <Link href={detailPath} onClick={(e) => e.stopPropagation()}>
                  <ChevronDown className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <p className="font-bold text-sm truncate mb-1">{title}</p>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {item.vote_average > 0 && (
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <Star className="w-3 h-3 fill-current" />
                      {item.vote_average.toFixed(1)}
                    </span>
                )}
                <span>{year}</span>
                <span className="uppercase text-[0.6rem] border px-1 py-0.5 rounded">{item.media_type}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
