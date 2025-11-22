
'use client'

import { notFound, useParams, useRouter } from "next/navigation";
import type { MediaType, MediaDetails } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getMediaDetails } from "@/lib/tmdb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  // Params are no longer passed as props in this client component
  // but we keep the type for structure.
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({}: Props) {
  // Use the hook to get params on the client
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const { mediaType, id } = params;
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  useEffect(() => {
    if (mediaType === "tv" && id) {
      setIsLoading(true);
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        notFound();
        return;
      }
      getMediaDetails(numericId, "tv")
        .then((data) => {
          setDetails(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [id, mediaType]);


  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const streamUrl = mediaType === 'tv'
    ? `https://cinemaos.tech/player/${id}/${season}/${episode}`
    : `https://cinemaos.tech/player/${id}`;
    
  const seasons = details && details.number_of_seasons
    ? Array.from({ length: details.number_of_seasons }, (_, i) => i + 1)
    : [];

  return (
    <div 
      className="relative w-screen h-screen bg-black group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-4 z-20 flex items-center gap-4"
        >
            <Button
                variant="secondary"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full h-12 w-12"
            >
                <ArrowLeft className="w-6 h-6" />
                <span className="sr-only">Go back</span>
            </Button>

            {mediaType === 'tv' && (
              <div className="flex gap-2">
                {isLoading ? (
                   <>
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                   </>
                ) : (
                  <>
                  {seasons.length > 0 && (
                     <Select
                        value={String(season)}
                        onValueChange={(value) => {
                          setSeason(Number(value));
                          setEpisode(1);
                        }}
                      >
                        <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Season" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((s) => (
                            <SelectItem key={s} value={String(s)}>Season {s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  )}
                    <Select
                        value={String(episode)}
                        onValueChange={(value) => setEpisode(Number(value))}
                    >
                        <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Episode" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* This is a simple assumption, a more robust solution would fetch episode counts per season */}
                          {Array.from({ length: 24 }, (_, i) => i + 1).map((e) => (
                            <SelectItem key={e} value={String(e)}>Episode {e}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            )}
        </motion.div>

      <iframe
          src={streamUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}

