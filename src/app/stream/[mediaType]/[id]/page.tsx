
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
    Elite: {
        movie: 'https://player.vidify.top/embed/movie/{id}',
        tv: 'https://player.vidify.top/embed/tv/{id}?s={season}&e={episode}',
        origin: 'https://player.vidify.top',
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

export default function StreamPage() {
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { streamSource } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  
  const { mediaType, id } = params;
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        const { origin, data } = event;
        if (!data) return;

        const progressKey = `progress_${mediaType}_${id}`;

        // Handle 'Elite' source (vidify)
        const eliteOrigin = sourceConfig['Elite'].origin as string;
        if (origin === eliteOrigin && data.type === 'WATCH_PROGRESS') {
            const payload = {
                ...data.data,
                lastWatched: Date.now(),
                mediaType,
                season: season ? Number(season) : undefined,
                episode: episode ? Number(episode) : undefined,
            };
            dispatchProgressEvent(progressKey, payload);
            return;
        }

        // Handle 'Prime' source (vidfast)
        if (vidfastOrigins.includes(origin)) {
            // Vidfast sends two types of events. We just grab the raw data and forward it.
            // The continue-watching component will parse it intelligently.
            if (data.type === 'PLAYER_EVENT' && data.data) {
                // For prime, the data doesn't contain everything, so we make a synthetic object
                const payload = {
                    ...data.data,
                    lastWatched: Date.now(),
                    mediaType,
                }
                dispatchProgressEvent(progressKey, payload);
            } else if (data.type === 'MEDIA_DATA' && data.data) {
                // This event contains the full structure, but we just save it under our key
                // and let the continue-watching component handle the complex object.
                dispatchProgressEvent(progressKey, data.data);
            }
        }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [id, mediaType, season, episode]);

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const getStreamUrl = () => {
    const source = sourceConfig[streamSource];
    let urlTemplate: string;

    if (mediaType === 'tv') {
        urlTemplate = source.tv;
        return urlTemplate.replace('{id}', id).replace('{season}', season || '1').replace('{episode}', episode || '1');
    }
    
    urlTemplate = source.movie;
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
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}
