
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from 'next/link';

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;

  return (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative aspect-[2/3] w-full"
    >
      <Link href={detailPath}>
        <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg">
            <Image
              src={posterUrl!}
              alt={title || "Media"}
              fill
              sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
              className="object-cover"
              data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </div>
      </Link>
    </motion.div>
  );
}
