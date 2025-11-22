
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StreamPage() {
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  
  const { mediaType, id } = params;
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  useEffect(() => {
    const handleMappleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://mapple.uk' || !event.data) return;

      if (event.data.type === 'MEDIA_DATA') {
          // This merges new data with existing data, which might be from other shows
          const existingData = JSON.parse(localStorage.getItem('mapplePlayerProgress') || '{}');
          const newData = { ...existingData, ...event.data.data };
          localStorage.setItem('mapplePlayerProgress', JSON.stringify(newData));
          // Dispatch a custom event to notify other components (like the carousel) of the change
          window.dispatchEvent(new Event('mapple-progress-change'));
      }

      if (event.data.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration } = event.data.data;
        // Example of handling player events
        console.log(`Player ${eventType} at ${currentTime}s of ${duration}s`);
      }
    };

    window.addEventListener('message', handleMappleMessage);

    return () => {
      window.removeEventListener('message', handleMappleMessage);
    };
  }, []);

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const getStreamUrl = () => {
    return mediaType === 'tv' && season && episode
      ? `https://mapple.uk/watch/tv/${id}-${season}-${episode}`
      : `https://mapple.uk/watch/movie/${id}`;
  }

  const streamUrl = getStreamUrl();

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
        </motion.div>

      <iframe
          src={streamUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
      />
    </div>
  );
}
