
'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStreams, getChannels } from "@/lib/iptv-api";
import type { IptvChannel, IptvStream } from "@/types/tmdb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  

export default function LiveStreamPage() {
  const params = useParams<{ channelId: string }>();
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [channel, setChannel] = useState<IptvChannel | null>(null);
  const [streams, setStreams] = useState<IptvStream[]>([]);
  const [selectedStreamUrl, setSelectedStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannelAndStreams() {
      if (!params.channelId) return;

      try {
        setIsLoading(true);
        const allChannels = await getChannels();
        const foundChannel = allChannels.find(c => c.id === params.channelId);

        if (!foundChannel) {
          setError("Channel not found.");
          setIsLoading(false);
          return;
        }
        setChannel(foundChannel);

        const allStreams = await getStreams();
        const channelStreams = allStreams.filter(s => s.channel === params.channelId);
        
        if (channelStreams.length > 0) {
          setStreams(channelStreams);
          setSelectedStreamUrl(channelStreams[0].url);
        } else {
          setError("No available streams for this channel.");
        }

      } catch (err) {
        setError("Failed to load channel data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChannelAndStreams();
  }, [params.channelId]);


  return (
    <div 
      className="relative w-screen h-screen bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <AnimatePresence>
        {isHovered && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-4 left-4 z-20 flex gap-2 items-center"
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
                {channel && (
                    <div className="bg-background/80 backdrop-blur-sm p-2 px-4 rounded-lg">
                        <h1 className="font-bold text-lg">{channel.name}</h1>
                    </div>
                )}
            </motion.div>
        )}
        </AnimatePresence>

        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )}

        {error && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Error Loading Stream</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             </div>
        )}

        {selectedStreamUrl && !isLoading && !error && (
            <iframe
                src={selectedStreamUrl}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                className="w-full h-full border-0"
            />
        )}
        
        <AnimatePresence>
            {isHovered && streams.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-4 right-4 z-20"
                >
                     <Select
                        onValueChange={(url) => setSelectedStreamUrl(url)}
                        defaultValue={selectedStreamUrl || undefined}
                    >
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a stream source" />
                        </SelectTrigger>
                        <SelectContent>
                            {streams.map((stream, index) => (
                                <SelectItem key={stream.url} value={stream.url}>
                                    {`Stream ${index + 1}`}
                                    {stream.status && ` - ${stream.status}`}
                                    {stream.height && ` (${stream.height}p)`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
