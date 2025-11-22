
'use client'

import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useUser, useFirestore } from "@/firebase";
import { getMediaDetails } from "@/lib/tmdb";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

type Props = {
  // Params are no longer passed as props in this client component
  // but we keep the type for structure.
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({}: Props) {
  // Use the hook to get params on the client
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isHovered, setIsHovered] = useState(false);
  
  const { mediaType, id } = params;
  
  // Get season and episode from query params
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  useEffect(() => {
    if (!user || !firestore || !id || !mediaType) return;
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return;

    const logContinueWatching = async () => {
      try {
        const mediaDetails = await getMediaDetails(numericId, mediaType);
        
        const historyRef = doc(firestore, 'users', user.uid, 'continueWatching', id);
        const dataToSet = {
          userId: user.uid,
          lastWatched: serverTimestamp(),
          media: { ...mediaDetails, media_type: mediaType },
        };
        
        // Non-blocking write
        setDoc(historyRef, dataToSet).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: historyRef.path,
                operation: 'write',
                requestResourceData: dataToSet,
            }));
        });
      } catch (error) {
        console.error("Failed to log continue watching:", error);
      }
    };

    logContinueWatching();
  }, [user, firestore, id, mediaType]);


  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const streamUrl = (mediaType === 'tv' && season && episode)
    ? `https://cinemaos.tech/player/${id}/${season}/${episode}`
    : `https://cinemaos.tech/player/${id}`;

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
            className="absolute top-4 left-4 z-20"
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
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}

    