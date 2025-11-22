
"use client";

import { useState, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import { getSeasonDetails } from '@/lib/tmdb';
import type { SeasonDetails, Episode } from '@/types/tmdb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import LoadingLink from './loading-link';
import { PlayCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getTmdbImageUrl } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';

interface EpisodeSelectorProps {
  showId: number;
  numberOfSeasons: number;
  title: string;
}

const EpisodeListItem = forwardRef<HTMLDivElement, { episode: Episode; showId: number; seasonNumber: number; }>(
    ({ episode, showId, seasonNumber }, ref) => {
    
    const streamPath = `/stream/tv/${showId}?s=${seasonNumber}&e=${episode.episode_number}`;

    return (
        <div ref={ref} className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="relative aspect-video w-32 md:w-48 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {episode.still_path ? (
                    <Image
                        src={getTmdbImageUrl(episode.still_path, 'w500')}
                        alt={`Still from ${episode.name}`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <h4 className="font-semibold mb-1">E{episode.episode_number}: {episode.name}</h4>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{episode.overview}</p>
                <Button size="sm" asChild>
                    <LoadingLink href={streamPath}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Watch Episode
                    </LoadingLink>
                </Button>
            </div>
        </div>
    );
});
EpisodeListItem.displayName = "EpisodeListItem";


export function EpisodeSelector({ showId, numberOfSeasons, title }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!selectedSeason) return;
      setIsLoading(true);
      try {
        const details = await getSeasonDetails(showId, selectedSeason);
        setSeasonDetails(details);
      } catch (error) {
        console.error("Failed to fetch season details:", error);
        setSeasonDetails(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeasonDetails();
  }, [selectedSeason, showId]);

  const seasons = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);
  const episodes = seasonDetails?.episodes || [];

  return (
    <Card className="bg-muted/30 overflow-hidden">
        <CardHeader>
            <CardTitle>Episodes</CardTitle>
            <CardDescription>Select a season to browse its episodes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Tabs
                defaultValue={String(selectedSeason)}
                onValueChange={(value) => setSelectedSeason(Number(value))}
                className="w-full"
            >
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <TabsList className="w-max">
                    {seasons.map((s) => (
                        <TabsTrigger key={s} value={String(s)}>Season {s}</TabsTrigger>
                    ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Tabs>

            <div className="relative min-h-[200px]">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedSeason}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {episodes.length > 0 ? (
                                <ScrollArea className="h-[400px] pr-4">
                                     <div className="space-y-2">
                                        {episodes.map(episode => (
                                            <EpisodeListItem 
                                                key={episode.id}
                                                episode={episode} 
                                                showId={showId}
                                                seasonNumber={selectedSeason}
                                            />
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground pt-10">
                                    No episodes found for this season.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CardContent>
    </Card>
  );
}
