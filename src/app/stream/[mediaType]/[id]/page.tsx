
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-provider";
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

    const details = await getMediaDetails(parseInt(mediaId), mediaType);
    
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
    
    if (mediaType === 'tv') {
        progressData = {
            ...progressData,
            season: season,
            episode: episode,
            episodeTitle: details.seasons?.find(s => s.season_number === parseInt(season!))?.name, // This is not quite right
        };
    }

    localStorage.setItem(progressKey, JSON.stringify(progressData));
    window.dispatchEvent(new CustomEvent('vidify-progress-change'));

  }, [mediaType, season, episode]);
  

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vidfast handler
      if (vidfastOrigins.includes(event.origin) && event.data?.type === 'MEDIA_DATA') {
        localStorage.setItem('vidFastProgress', JSON.stringify(event.data.data));
        window.dispatchEvent(new CustomEvent('vidfast-progress-change'));
      }
      
      // Vidify handler
      if (event.origin === 'https://player.vidify.top' && event.data?.type === 'WATCH_PROGRESS') {
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
    if (streamSource === 'vidify') {
        const vidifyUrl = mediaType === 'tv' && season && episode
            ? `https://player.vidify.top/embed/tv/${id}?s=${season}&e=${episode}`
            : `https://player.vidify.top/embed/movie/${id}`;
        
        const url = new URL(vidifyUrl);
        url.searchParams.set('autoplay', 'true');
        url.searchParams.set('poster', 'true');
        url.searchParams.set('chromecast', 'false');
        url.searchParams.set('servericon', 'true');
        url.searchParams.set('setting', 'true');
        url.searchParams.set('pip', 'false');
        url.searchParams.set('download', 'true');
        url.searchParams.set('logourl', 'https://i.ibb.co/67wTJd9R/pngimg-com-netflix-PNG11.png');
        url.searchParams.set('font', 'Roboto');
        url.searchParams.set('fontcolor', '6f63ff');
        url.searchParams.set('fontsize', '20');
        url.searchParams.set('opacity', '0.5');
        url.searchParams.set('primarycolor', 'fdfff5');
        url.searchParams.set('secondarycolor', '000000');
        url.searchParams.set('iconcolor', 'c2c2c2');
        
        return url.toString();
    }

    // Default to vidfast
    return mediaType === 'tv' && season && episode
      ? `https://vidfast.pro/tv/${id}/${season}/${episode}`
      : `https://vidfast.pro/movie/${id}`;
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
