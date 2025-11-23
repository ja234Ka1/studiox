
'use client'

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getLiveMatchesAction, getStreamAction } from "@/app/actions/streamed";
import type { APIMatch, Stream } from "@/types/streamed";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStreamedImageUrl } from "@/lib/utils";
import Image from "next/image";

export default function SportsStreamPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const { matchId } = params;

  const [match, setMatch] = useState<APIMatch | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatchAndStreams = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const liveMatches = await getLiveMatchesAction();
        const currentMatch = liveMatches.find(m => m.id === matchId);

        if (!currentMatch) {
          throw new Error("Match not found or is no longer live.");
        }
        setMatch(currentMatch);

        if (currentMatch.sources && currentMatch.sources.length > 0) {
          // For simplicity, we'll use the first available source.
          const source = currentMatch.sources[0];
          const fetchedStreams = await getStreamAction(source.source, source.id);
          
          if (fetchedStreams.length > 0) {
            setStreams(fetchedStreams);
            setSelectedStream(fetchedStreams[0]);
          } else {
            setError("No streams available for this match.");
          }
        } else {
          setError("No stream sources found for this match.");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load match data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchAndStreams();
  }, [matchId]);

  if (isLoading) {
      return (
          <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Loading Match...</p>
          </div>
      )
  }

  return (
    <div className="relative w-screen h-screen bg-black group">
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full h-12 w-12"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Go back</span>
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-4 items-center bg-black/50 p-2 rounded-lg">
        {match && (
            <div className="flex items-center gap-2">
                {match.teams?.home?.badge && <Image src={getStreamedImageUrl(match.teams.home.badge, 'badge')} alt={match.teams.home.name} width={24} height={24} />}
                <span className="text-white font-semibold text-sm">{match.title}</span>
                {match.teams?.away?.badge && <Image src={getStreamedImageUrl(match.teams.away.badge, 'badge')} alt={match.teams.away.name} width={24} height={24} />}
            </div>
        )}
        {streams.length > 1 && selectedStream && (
             <Select
                onValueChange={(id) => setSelectedStream(streams.find(s => s.id === id) || null)}
                defaultValue={selectedStream.id}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Stream" />
                </SelectTrigger>
                <SelectContent>
                    {streams.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                            {`Stream ${s.streamNo} (${s.language}) ${s.hd ? 'HD' : ''}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
      </div>

      {error && !isLoading ? (
        <div className="w-full h-full flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Stream Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : selectedStream?.embedUrl ? (
        <iframe
          src={selectedStream.embedUrl}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4">
             <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Stream Error</AlertTitle>
                <AlertDescription>Could not load the selected stream.</AlertDescription>
            </Alert>
        </div>
      )}
    </div>
  );
}
