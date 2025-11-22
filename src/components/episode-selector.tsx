
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getSeasonDetails } from '@/lib/tmdb';
import type { SeasonDetails } from '@/types/tmdb';
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
import { ScrollArea } from './ui/scroll-area';

interface EpisodeSelectorProps {
  showId: number;
  numberOfSeasons: number;
  title: string;
}

export function EpisodeSelector({ showId, numberOfSeasons, title }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!selectedSeason) return;
      setIsLoading(true);
      try {
        const details = await getSeasonDetails(showId, selectedSeason);
        setSeasonDetails(details);
        // Reset to first episode when season changes, if episodes exist
        if (details.episodes?.length > 0) {
            setSelectedEpisode(1);
        } else {
            setSelectedEpisode(0);
        }
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
  const streamPath = `/stream/tv/${showId}?s=${selectedSeason}&e=${selectedEpisode}`;
  
  const episodes = seasonDetails?.episodes || [];
  const selectedEpisodeDetails = episodes.find(e => e.episode_number === selectedEpisode);

  return (
    <Card className="bg-muted/30 overflow-hidden">
        <CardHeader>
            <CardTitle>Episodes</CardTitle>
            <CardDescription>Select a season and episode to start watching.</CardDescription>
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
                </ScrollArea>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 relative aspect-[2/3] rounded-md overflow-hidden bg-muted">
                    {isLoading && <Skeleton className="w-full h-full" />}
                    {!isLoading && seasonDetails?.poster_path && (
                        <Image 
                            src={getTmdbImageUrl(seasonDetails.poster_path, 'w500')} 
                            alt={`Poster for ${seasonDetails.name}`}
                            fill
                            className="object-cover"
                        />
                    )}
                     {!isLoading && !seasonDetails?.poster_path && (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No Poster</p>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                        <div className="mb-4">
                            <Select
                                value={String(selectedEpisode)}
                                onValueChange={(value) => setSelectedEpisode(Number(value))}
                                disabled={isLoading || episodes.length === 0}
                            >
                                <SelectTrigger>
                                    {isLoading ? (
                                        <span className='flex items-center gap-2 text-muted-foreground'>
                                            <Loader2 className="animate-spin" /> Loading Episodes...
                                        </span>
                                    ) : (
                                        <SelectValue placeholder="Select an episode" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {episodes.length > 0 ? episodes.map((e) => (
                                        <SelectItem key={e.id} value={String(e.episode_number)}>
                                            E{e.episode_number}: {e.name}
                                        </SelectItem>
                                    )) : <SelectItem value="0" disabled>No episodes found for this season.</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        {isLoading ? (
                            <div className='space-y-3'>
                                <Skeleton className="aspect-video w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : selectedEpisodeDetails ? (
                            <div className="space-y-4">
                                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                                    <Image 
                                        src={getTmdbImageUrl(selectedEpisodeDetails.still_path, 'w500')}
                                        alt={`Still from ${selectedEpisodeDetails.name}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h4 className='font-semibold text-lg'>{selectedEpisodeDetails.name}</h4>
                                <p className='text-muted-foreground text-sm line-clamp-3'>{selectedEpisodeDetails.overview}</p>
                            </div>
                        ) : !isLoading && episodes.length > 0 && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select an episode to see details.
                            </div>
                        )}
                    </div>
                
                    <Button size="lg" asChild disabled={!selectedSeason || !selectedEpisode || isLoading} className="mt-6 w-full sm:w-auto self-start">
                        <LoadingLink href={streamPath}>
                            <PlayCircle className="mr-2" />
                            Watch S{selectedSeason} E{selectedEpisode}
                        </LoadingLink>
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
