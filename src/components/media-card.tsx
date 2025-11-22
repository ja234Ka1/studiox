
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, PlayCircle } from "lucide-react";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;

  return (
    <Link href={detailPath}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
        transition={{ duration: 0.2 }}
        className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card cursor-pointer shadow-md"
      >
        <Image
          src={posterUrl!}
          alt={title || "Media poster"}
          fill
          sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover"
          data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <h3 className="text-white font-bold text-sm truncate">{title}</h3>
           <div className="flex items-center gap-2 mt-2">
                <Button size="icon" className="h-8 w-8 rounded-full" asChild>
                  <Link href={detailPath}>
                    <PlayCircle className="w-4 h-4 fill-current" />
                  </Link>
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                  <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </motion.div>
    </Link>
  );
}
