
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
        // Reset to first episode when season changes
        if (details.episodes?.length > 0) {
            setSelectedEpisode(1);
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
        <CardContent>
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
                </div>

                <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <Select
                                    value={String(selectedSeason)}
                                    onValueChange={(value) => setSelectedSeason(Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Season" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {seasons.map((s) => (
                                        <SelectItem key={s} value={String(s)}>Season {s}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1">
                                <Select
                                    value={String(selectedEpisode)}
                                    onValueChange={(value) => setSelectedEpisode(Number(value))}
                                    disabled={isLoading || episodes.length === 0}
                                >
                                    <SelectTrigger>
                                        {isLoading ? (
                                            <span className='flex items-center gap-2 text-muted-foreground'>
                                                <Loader2 className="animate-spin" /> Loading...
                                            </span>
                                        ) : (
                                            <SelectValue placeholder="Episode" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                    {episodes.map((e) => (
                                        <SelectItem key={e.id} value={String(e.episode_number)}>
                                            E{e.episode_number}: {e.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className='space-y-3'>
                                <Skeleton className="h-40 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : selectedEpisodeDetails && (
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
                        )}
                    </div>
                
                    <Button size="lg" asChild disabled={!selectedSeason || !selectedEpisode || isLoading} className="mt-6 w-full sm:w-auto">
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
