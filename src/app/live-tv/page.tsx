
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import LoadingLink from '@/components/loading-link';
import { liveChannels, LiveChannel } from '@/lib/livetv-channels';

const ChannelCard = ({ channel }: { channel: LiveChannel }) => (
  <LoadingLink href={`/live/${channel.id}`} className="group block">
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:border-accent bg-card">
      <CardContent className="relative aspect-video p-0 flex items-center justify-center bg-zinc-900/50">
        <Image
          src={channel.logo}
          alt={`${channel.name} logo`}
          width={120}
          height={120}
          className="object-contain transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-12 h-12 text-white/80" />
        </div>
        <div className="absolute bottom-0 left-0 p-3">
          <h3 className="font-bold text-white text-sm truncate w-full">{channel.name}</h3>
        </div>
      </CardContent>
    </Card>
  </LoadingLink>
);

export default function LiveTvPage() {
  const channelsByCategory = liveChannels.reduce((acc, channel) => {
    const category = channel.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, LiveChannel[]>);

  const categories = Object.keys(channelsByCategory);

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Live TV</h1>
        <p className="text-muted-foreground mt-1">
          Watch your favorite channels live.
        </p>
      </header>
      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {channelsByCategory[category].map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
