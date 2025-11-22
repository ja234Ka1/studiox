
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StreamSource = 'vidzee' | 'vidking';

export default function StreamPage() {
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [source, setSource] = useState<StreamSource>('vidzee');
  
  const { mediaType, id } = params;
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  useEffect(() => {
    const handleVidZeeMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vidzee.wtf') return;

      if (event.data?.type === 'MEDIA_DATA') {
          const mediaData = event.data.data;
          // This merges new data with existing data, which might be from other shows
          const existingData = JSON.parse(localStorage.getItem('vidZeeProgress') || '{}');
          const newData = { ...existingData, ...mediaData };
          localStorage.setItem('vidZeeProgress', JSON.stringify(newData));
          // Dispatch a custom event to notify other components (like the carousel) of the change
          window.dispatchEvent(new Event('vidzee-progress-change'));
      }

      if (event.data?.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration } = event.data.data;
        // Example of handling player events
        console.log(`Player ${eventType} at ${currentTime}s of ${duration}s`);
      }
    };

    window.addEventListener('message', handleVidZeeMessage);

    return () => {
      window.removeEventListener('message', handleVidZeeMessage);
    };
  }, []);

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const getStreamUrl = (selectedSource: StreamSource) => {
    if (selectedSource === 'vidking') {
        return (mediaType === 'tv' && season && episode)
            ? `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`
            : `https://www.vidking.net/embed/movie/${id}`;
    }
    // Default to vidzee
    return (mediaType === 'tv' && season && episode)
        ? `https://player.vidzee.wtf/embed/tv/${id}/${season}/${episode}`
        : `https://player.vidzee.wtf/embed/movie/${id}`;
  }

  const streamUrl = getStreamUrl(source);

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
            className="absolute top-4 left-4 z-20 flex gap-2"
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
            <div className="flex items-center gap-1 bg-secondary/80 rounded-full p-1">
                <Button
                    size="sm"
                    onClick={() => setSource('vidzee')}
                    className={cn("rounded-full", source === 'vidzee' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-secondary-foreground hover:bg-secondary/50')}
                >
                    VidZee
                </Button>
                 <Button
                    size="sm"
                    onClick={() => setSource('vidking')}
                    className={cn("rounded-full", source === 'vidking' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-secondary-foreground hover:bg-secondary/50')}
                >
                    VidKing
                </Button>
            </div>
        </motion.div>

      <iframe
          key={source} // Add key to force iframe remount on source change
          src={streamUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}
