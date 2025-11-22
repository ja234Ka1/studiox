
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: Media;
  onHover: (el: HTMLDivElement | null, item: Media | null) => void;
}

export function MediaCard({ item, onHover }: MediaCardProps) {
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  const title = item.title || item.name;

  return (
    <motion.div
      layoutId={`card-container-${item.id}`}
      ref={(el) => onHover(el, item)}
      className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card cursor-pointer"
    >
      <Image
        src={posterUrl!}
        alt={title || "Media poster"}
        fill
        sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
        className="object-cover"
        data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
      />
    </motion.div>
  );
}
