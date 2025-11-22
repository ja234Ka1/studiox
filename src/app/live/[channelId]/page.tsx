
'use client'

import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { liveChannels } from "@/lib/livetv-channels";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LiveStreamPage() {
  const params = useParams<{ channelId: string }>();
  const router = useRouter();
  
  const [isHovered, setIsHovered] = useState(false);
  
  const { channelId } = params;

  const channel = liveChannels.find(c => c.id === channelId);

  if (!channel) {
    notFound();
  }

  const streamUrl = channel.url;

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

        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>

        {streamUrl.endsWith('.m3u8') ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <Alert variant="destructive">
                    <AlertTitle>Unsupported Format</AlertTitle>
                    <AlertDescription>This stream is in an HLS (.m3u8) format, which cannot be played directly in a browser. A dedicated video player is required.</AlertDescription>
                </Alert>
            </div>
        ) : (
             <iframe
                src={streamUrl}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                className="w-full h-full border-0 relative z-10"
              />
        )}
    </div>
  );
}
