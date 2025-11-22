
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({}: Props) {
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  
  const { mediaType, id } = params;
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  useEffect(() => {
    const handleVidZeeMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vidzee.wtf') return;

      if (event.data?.type === 'MEDIA_DATA') {
          const mediaData = event.data.data;
          localStorage.setItem('vidZeeProgress', JSON.stringify(mediaData));
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

  const streamUrl = (mediaType === 'tv' && season && episode)
    ? `https://player.vidzee.wtf/embed/tv/${id}/${season}/${episode}`
    : `https://player.vidzee.wtf/embed/movie/${id}`;

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
            className="absolute top-4 left-4 z-20"
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
      />
    </div>
  );
}
