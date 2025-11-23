
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme, type StreamSource } from "@/context/theme-provider";

const vidfastOrigins = [
    'https://vidfast.pro',
    'https://vidfast.in',
    'https://vidfast.io',
    'https://vidfast.me',
    'https://vidfast.net',
    'https://vidfast.pm',
    'https://vidfast.xyz'
];

const sourceConfig: Record<StreamSource, { movie: string, tv: string, origin: string | string[] }> = {
    Prime: {
        movie: 'https://vidfast.pro/movie/{id}',
        tv: 'https://vidfast.pro/tv/{id}/{season}/{episode}',
        origin: vidfastOrigins,
    },
}

/**
 * Dispatches a custom event with progress data so other components can listen.
 * It also saves the raw data to localStorage for persistence.
 */
const dispatchProgressEvent = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('willow-progress-change', { detail: { key, data } }));
}


// A simplified type for the data we track for saving progress
interface PlayerState {
  playing: boolean;
  rawProgressData: any;
}


export default function StreamPage() {
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { streamSource } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { mediaType, id } = params;
  const playerStateRef = useRef<PlayerState | null>(null);
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');
  const progressKey = `progress_${mediaType}_${id}`;

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        const { origin, data } = event;
        if (!data) return;

        // Common handler for both sources to update the player state ref
        const updatePlayerState = (isPlaying: boolean, progressData: any) => {
             playerStateRef.current = {
                playing: isPlaying,
                rawProgressData: progressData
             };
        }

        // Handle 'Prime' source (vidfast)
        if (vidfastOrigins.includes(origin)) {
            let payload;
            if (data.type === 'PLAYER_EVENT' && data.data) {
                payload = { ...data.data, lastWatched: Date.now(), mediaType };
                updatePlayerState(data.data.playing, payload);
                dispatchProgressEvent(progressKey, payload);
            } else if (data.type === 'MEDIA_DATA' && data.data) {
                payload = { ...data.data, mediaType };
                 // Assume not playing on initial data load
                updatePlayerState(false, payload);
                dispatchProgressEvent(progressKey, payload);
            }
        }
    };

    window.addEventListener('message', handleMessage);

    // Set up an interval to save progress every 5 seconds if playing
    const intervalId = setInterval(() => {
        if (playerStateRef.current?.playing && playerStateRef.current?.rawProgressData) {
            const currentData = {
                ...playerStateRef.current.rawProgressData,
                lastWatched: Date.now(), // Always update timestamp
            };
            dispatchProgressEvent(progressKey, currentData);
        }
    }, 5000); // 5 seconds

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(intervalId);
      
      // Save one last time when the user navigates away
      if (playerStateRef.current?.rawProgressData) {
        const finalData = {
            ...playerStateRef.current.rawProgressData,
            lastWatched: Date.now(),
        };
        dispatchProgressEvent(progressKey, finalData);
      }
    };
  }, [id, mediaType, season, episode, progressKey]);

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const getStreamUrl = () => {
    const sourceDetails = sourceConfig[streamSource] || sourceConfig['Prime'];
    let urlTemplate: string;
  
    if (mediaType === 'tv') {
        urlTemplate = sourceDetails.tv;
        return urlTemplate.replace('{id}', id).replace('{season}', season || '1').replace('{episode}', episode || '1');
    }
    
    urlTemplate = sourceDetails.movie;
    let url = urlTemplate.replace('{id}', id);
    
    return url;
  }
  

  const streamUrl = getStreamUrl();

  return (
    <div 
      className="relative w-screen h-screen bg-black group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isClient && (
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
      )}

      <iframe
          src={streamUrl}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}
