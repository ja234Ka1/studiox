
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

const dispatchProgressEvent = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('willow-progress-change', { detail: { key } }));
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

  const handleProgress = useCallback((data: any) => {
    const progressKey = `progress_${mediaType}_${id}`;
    let progressData: any = {
      ...data,
      mediaType,
      season,
      episode
    };
    dispatchProgressEvent(progressKey, progressData);
  }, [mediaType, id, season, episode]);
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vidify handler for 'Elite' source
      const vidifyOrigin = sourceConfig['Elite'].origin;
      if (event.origin === vidifyOrigin && event.data?.type === 'WATCH_PROGRESS') {
        handleProgress(event.data.data);
        return;
      }

      // Vidfast handler for 'Prime' source
      if (vidfastOrigins.includes(event.origin) && event.data?.type === 'MEDIA_DATA' && event.data.data) {
        const d = event.data.data;
        const progressKey = `progress_${d.type}_${d.id}`;
        
        const isMovie = d.type === 'movie';
        const progress = isMovie ? d.progress : (d.show_progress?.[`${d.last_season_watched}-${d.last_episode_watched}`]?.progress);
        
        if (!progress) return;

        const progressPayload = {
            currentTime: progress.watched,
            duration: progress.duration,
            lastWatched: d.last_updated,
            eventType: 'timeupdate',
            mediaType: d.type,
            title: d.title,
            poster: d.poster_path,
            watched_percentage: (progress.watched / progress.duration) * 100,
            season: d.last_season_watched,
            episode: d.last_episode_watched,
        }
        dispatchProgressEvent(progressKey, progressPayload);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleProgress]);

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
