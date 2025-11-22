
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
  const streamPath = `/stream/${item.media_type}/${item.id}`;
  
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative aspect-[2/3] w-full rounded-md overflow-hidden cursor-pointer group flex-shrink-0"
      transition={{ duration: 0.3 }}
      layoutId={`top-10-card-${item.id}`}
    >
        <LoadingLink href={detailPath} className="w-full h-full block">
            <Image
                src={posterUrl!}
                alt={title || "Media"}
                fill
                sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
                className="object-cover z-10"
                data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
            />
        </LoadingLink>

      <div className="absolute -bottom-1/4 -left-[30%] text-accent text-[20rem] font-black leading-none text-outline opacity-50 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-x-4 group-hover:-translate-y-4">
        {rank + 1}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 p-4 flex flex-col justify-end text-left bg-gradient-to-t from-black/90 via-black/50 to-transparent"
          >
            <motion.h3 variants={itemVariants} className="text-white font-bold text-lg truncate w-full mb-1">{title}</motion.h3>
            <motion.div variants={itemVariants} className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current"/>
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button 
                size="sm"
                className="w-full bg-primary/80 hover:bg-primary text-primary-foreground backdrop-blur-sm"
                asChild
              >
                <LoadingLink href={streamPath} onClick={(e) => e.stopPropagation()}>
                  <PlayCircle className="mr-2" />
                  Watch
                </LoadingLink>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
