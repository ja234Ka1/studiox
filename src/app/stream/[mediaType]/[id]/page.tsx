
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme, type StreamSource } from "@/context/theme-provider";
import { getMediaDetails } from "@/lib/tmdb";

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

export default function StreamPage() {
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { streamSource } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  
  const { mediaType, id } = params;
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  const handleVidifyProgress = useCallback(async (data: any) => {
    const { mediaId, currentTime, duration, eventType } = data;
    const progressKey = `progress_${mediaType}_${mediaId}`;
    
    let existingData = {};
    try {
      const stored = localStorage.getItem(progressKey);
      if (stored) existingData = JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse progress data from localStorage", e);
    }

    const numericId = parseInt(id, 10);
    const details = await getMediaDetails(numericId, mediaType);
    
    let progressData: any = {
      ...existingData,
      currentTime,
      duration,
      lastWatched: Date.now(),
      eventType,
      mediaType,
      title: details.title || details.name,
      poster: details.poster_path,
      watched_percentage: (currentTime / duration) * 100,
    };
    
    if (mediaType === 'tv' && details.seasons) {
        const seasonData = details.seasons.find(s => s.season_number === parseInt(season!));
        if (seasonData) {
             const episodeData = seasonData.episodes.find(e => e.episode_number === parseInt(episode!));
             progressData.episodeTitle = episodeData?.name;
        }
        progressData = {
            ...progressData,
            season: season,
            episode: episode,
        };
    }

    localStorage.setItem(progressKey, JSON.stringify(progressData));
    window.dispatchEvent(new CustomEvent('vidify-progress-change'));

  }, [mediaType, season, episode, id]);
  

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vidfast handler
      if (vidfastOrigins.includes(event.origin) && event.data?.type === 'MEDIA_DATA') {
        localStorage.setItem('vidFastProgress', JSON.stringify(event.data.data));
        window.dispatchEvent(new CustomEvent('vidfast-progress-change'));
      }
      
      // Vidify handler
      const vidifyOrigin = sourceConfig['Elite'].origin;
      if (event.origin === vidifyOrigin && event.data?.type === 'WATCH_PROGRESS') {
        handleVidifyProgress(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleVidifyProgress]);

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

    // Append vidify-specific params
    if (source.origin.includes('vidify')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('autoplay', 'true');
        urlObj.searchParams.set('poster', 'true');
        urlObj.searchParams.set('chromecast', 'false');
        urlObj.searchParams.set('servericon', 'true');
        urlObj.searchParams.set('setting', 'true');
        urlObj.searchParams.set('pip', 'false');
        urlObj.searchParams.set('download', 'true');
        urlObj.searchParams.set('logourl', 'https://i.ibb.co/67wTJd9R/pngimg-com-netflix-PNG11.png');
        urlObj.searchParams.set('font', 'Roboto');
        urlObj.searchParams.set('fontcolor', '6f63ff');
        urlObj.searchParams.set('fontsize', '20');
        urlObj.searchParams.set('opacity', '0.5');
        urlObj.searchParams.set('primarycolor', 'fdfff5');
        urlObj.searchParams.set('secondarycolor', '000000');
        urlObj.searchParams.set('iconcolor', 'c2c2c2');
        return urlObj.toString();
    }
    
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
