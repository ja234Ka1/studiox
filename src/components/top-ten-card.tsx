
'use client';

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import LoadingLink from "./loading-link";

interface TopTenCardProps {
  item: Media;
  rank: number;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
};

export function TopTenCard({ item, rank }: TopTenCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;
  
  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const streamPath = item.media_type === 'tv'
      ? `/stream/tv/${item.id}?s=1&e=1`
      : `/stream/movie/${item.id}`;
    router.push(streamPath);
  }
  
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative aspect-[2/3] w-52 rounded-lg cursor-pointer group flex-shrink-0"
      transition={{ duration: 0.3 }}
      layoutId={`top-10-card-${item.id}`}
    >
      <div 
        className="absolute -bottom-12 -left-[55%] text-accent text-[12rem] font-black leading-none text-outline-primary transition-all duration-300 ease-out group-hover:text-primary group-hover:scale-110 z-0"
      >
          {rank + 1}
      </div>

      <LoadingLink href={detailPath} className="w-full h-full block relative z-10">
          <motion.div 
              className="w-full h-full rounded-lg overflow-hidden shadow-2xl bg-muted"
              whileHover={{ scale: 1.05, y: -20, x: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {posterUrl && (
              <Image
                  src={posterUrl}
                  alt={title || "Media"}
                  fill
                  sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
                  className="object-cover"
                  data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
              />
            )}
          </motion.div>
      </LoadingLink>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute z-20 inset-0 p-4 flex flex-col justify-end text-left bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-lg pointer-events-none"
          >
            <motion.h3 variants={itemVariants} className="text-white font-bold text-lg truncate w-full mb-1">{title}</motion.h3>
            <motion.div variants={itemVariants} className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current"/>
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="pointer-events-auto">
              <Button 
                size="sm"
                className="w-full bg-primary/80 hover:bg-primary text-primary-foreground backdrop-blur-sm"
                onClick={handleWatchClick}
              >
                  <PlayCircle className="mr-2" />
                  Watch
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
