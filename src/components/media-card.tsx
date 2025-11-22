
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, PlayCircle, Star } from "lucide-react";
import { useState } from "react";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;
  const year = item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!).getFullYear() : 'N/A';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(detailPath);
  }

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card shadow-md cursor-pointer group"
    >
      <Link href={detailPath} className="w-full h-full">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <Image
              src={posterUrl!}
              alt={title || "Media"}
              fill
              sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
              className="object-cover"
              data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
          />
        </motion.div>

        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
          >
            <h3 className="text-white font-bold text-sm truncate mb-2">{title}</h3>
            <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current"/>
                    <span>{item.vote_average.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" className="h-8 w-8 rounded-full" onClick={handlePlayClick}>
                  <PlayCircle className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => {e.preventDefault(); e.stopPropagation(); /* Add to watchlist */}}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </Link>
    </motion.div>
  );
}
