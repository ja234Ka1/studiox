
"use client";

import { useState, useEffect } from 'react';
import { getSeasonDetails } from '@/lib/tmdb';
import type { Episode } from '@/types/tmdb';
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

interface EpisodeSelectorProps {
  showId: number;
  numberOfSeasons: number;
  title: string;
}

export function EpisodeSelector({ showId, numberOfSeasons, title }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return;
      setIsLoading(true);
      try {
        const seasonDetails = await getSeasonDetails(showId, selectedSeason);
        setEpisodes(seasonDetails.episodes);
        // Reset to first episode when season changes
        if (seasonDetails.episodes.length > 0) {
            setSelectedEpisode(1);
        }
      } catch (error) {
        console.error("Failed to fetch season details:", error);
        setEpisodes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEpisodes();
  }, [selectedSeason, showId]);

  const seasons = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);
  const streamPath = `/stream/tv/${showId}?s=${selectedSeason}&e=${selectedEpisode}`;
  const selectedEpisodeDetails = episodes.find(e => e.episode_number === selectedEpisode);

  return (
    <Card className="bg-muted/30">
        <CardHeader>
            <CardTitle>Episodes</CardTitle>
            <CardDescription>Select a season and episode to start watching.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                                Episode {e.episode_number}: {e.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedEpisodeDetails && (
                 <div className="text-sm space-y-2 mb-6">
                    <h4 className='font-semibold'>{selectedEpisodeDetails.name}</h4>
                    <p className='text-muted-foreground line-clamp-3'>{selectedEpisodeDetails.overview}</p>
                </div>
            )}
           
            <Button size="lg" asChild disabled={!selectedSeason || !selectedEpisode}>
                <LoadingLink href={streamPath}>
                <PlayCircle className="mr-2" />
                Watch S{selectedSeason} E{selectedEpisode}
                </LoadingLink>
            </Button>
        </CardContent>
    </Card>
  );
}
