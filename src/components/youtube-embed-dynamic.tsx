
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const YouTubeEmbed = dynamic(() => import('./youtube-embed'), {
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
  ssr: false, // This component will only be rendered on the client
});

export default YouTubeEmbed;
