
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Info, PlayCircle } from "lucide-react";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/context/video-provider";
import LoadingLink from "./loading-link";

interface HeroProps {
  item: Media;
}

export function Hero({ item }: HeroProps) {
  const { playVideo } = useVideo();
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const detailPath = `/media/${item.media_type}/${item.id}`;


  const handlePlay = () => {
    playVideo(item.id, item.media_type);
  };

  return (
    <div className="relative w-full h-[60vh] lg:h-[80vh]">
      <div className="absolute inset-0">
        <Image
          src={getTmdbImageUrl(item.backdrop_path, "original")}
          alt={title || "Hero backdrop"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 container h-full flex flex-col justify-end pb-16 md:pb-24 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="text-sm">{item.media_type.toUpperCase()}</Badge>
            <Badge variant="outline" className="text-sm">{year}</Badge>
            {item.vote_average > 0 && (
                <Badge variant="default" className="bg-accent text-accent-foreground text-sm">
                    Rating: {item.vote_average.toFixed(1)}
                </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight mb-4">
            {title}
          </h1>
          <p className="text-muted-foreground line-clamp-3 mb-8">
            {item.overview}
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <LoadingLink href={detailPath}>
                <PlayCircle className="mr-2" />
                Watch Now
              </LoadingLink>
            </Button>
            <Button size="lg" variant="secondary" onClick={handlePlay}>
              <Info className="mr-2" />
              Play Trailer
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
