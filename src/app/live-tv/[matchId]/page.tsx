
'use client'

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getStreams, getImageUrl } from '@/lib/streamed-api';
import type { StreamedStream, StreamedMatchWithEncodedSources, StreamedMatch } from '@/types/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import { Loader2, AlertTriangle, Tv, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function MatchStreamPage() {
    const searchParams = useSearchParams();
    const [match, setMatch] = useState<StreamedMatch | null>(null);
    const [streams, setStreams] = useState<StreamedStream[]>([]);
    const [selectedStream, setSelectedStream] = useState<StreamedStream | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const matchData: Partial<StreamedMatchWithEncodedSources> = {};
        searchParams.forEach((value, key) => {
            (matchData as any)[key] = value;
        });

        if (matchData.id && matchData.sources) {
            try {
                const parsedSources = JSON.parse(matchData.sources);
                const fullMatchData: StreamedMatch = {
                    ...matchData,
                    sources: parsedSources,
                    date: Number(matchData.date),
                } as StreamedMatch;

                setMatch(fullMatchData);

                if (parsedSources.length > 0) {
                    const firstSource = parsedSources[0];
                    setIsLoading(true);
                    getStreams(firstSource.source, firstSource.id)
                        .then(fetchedStreams => {
                            if (fetchedStreams.length > 0) {
                                setStreams(fetchedStreams);
                                setSelectedStream(fetchedStreams[0]);
                            } else {
                                setError('No playable streams found for this match.');
                            }
                        })
                        .catch(() => setError('Failed to load stream information.'))
                        .finally(() => setIsLoading(false));
                } else {
                    setError('No stream sources available for this match.');
                    setIsLoading(false);
                }
            } catch (e) {
                setError('Invalid match data provided.');
                setIsLoading(false);
            }
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <header className="p-4 flex items-center justify-between bg-zinc-900/80">
                <Link href="/live-tv" className="flex items-center gap-2 hover:text-accent transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Live TV</span>
                </Link>
                {match && (
                    <div className="text-center">
                        <h1 className="text-lg font-bold truncate">{match.title}</h1>
                        <p className="text-xs text-muted-foreground">{format(new Date(match.date), "MMM d, h:mm a")}</p>
                    </div>
                )}
                <div className="w-32"></div>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
                <div className="lg:col-span-3">
                    <Card className="w-full aspect-video bg-zinc-900 border-zinc-700 rounded-lg overflow-hidden">
                        {isLoading && !error && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="w-12 h-12 animate-spin text-accent" />
                                <p className="mt-4 text-muted-foreground">Finding best stream...</p>
                            </div>
                        )}
                        {error && (
                             <div className="flex flex-col items-center justify-center h-full p-4">
                                <AlertTriangle className="w-12 h-12 text-destructive" />
                                <p className="mt-4 text-destructive font-semibold">Stream Unavailable</p>
                                <p className="text-sm text-center text-muted-foreground mt-1">{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && selectedStream?.embedUrl && (
                            <iframe
                                src={selectedStream.embedUrl}
                                allow="autoplay; fullscreen; encrypted-media"
                                allowFullScreen
                                className="w-full h-full border-0"
                            ></iframe>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="bg-zinc-900/80 border-zinc-800 h-full">
                        <CardContent className="p-4">
                            <h2 className="text-lg font-semibold mb-3 border-b border-zinc-700 pb-2">Available Streams</h2>
                             {isLoading && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</div>}
                             {streams.length > 0 && (
                                <div className="space-y-2 max-h-[75vh] overflow-y-auto">
                                    {streams.map((stream) => (
                                        <Button
                                            key={stream.id}
                                            variant={selectedStream?.id === stream.id ? 'secondary' : 'ghost'}
                                            className="w-full justify-start"
                                            onClick={() => setSelectedStream(stream)}
                                        >
                                            <Tv className="w-4 h-4 mr-3" />
                                            <div className="flex-grow text-left">
                                                <p>Stream {stream.streamNo} ({stream.source})</p>
                                                <p className="text-xs text-muted-foreground">{stream.language} {stream.hd && <Badge variant="outline" className="ml-2 border-green-500 text-green-500 px-1 py-0 text-[10px]">HD</Badge>}</p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            )}
                             {!isLoading && streams.length === 0 && <p className="text-sm text-muted-foreground">No streams found.</p>}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
