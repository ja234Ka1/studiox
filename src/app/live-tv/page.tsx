
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import LoadingLink from '@/components/loading-link';

const liveChannels = [
  { name: 'Channel 1', logo: 'https://picsum.photos/seed/ch1/200/200', category: 'News' },
  { name: 'Channel 2', logo: 'https://picsum.photos/seed/ch2/200/200', category: 'Sports' },
  { name: 'Channel 3', logo: 'https://picsum.photos/seed/ch3/200/200', category: 'Movies' },
  { name: 'Channel 4', logo: 'https://picsum.photos/seed/ch4/200/200', category: 'Entertainment' },
  { name: 'Channel 5', logo: 'https://picsum.photos/seed/ch5/200/200', category: 'Music' },
  { name: 'Channel 6', logo: 'https://picsum.photos/seed/ch6/200/200', category: 'Kids' },
  { name: 'Channel 7', logo: 'https://picsum.photos/seed/ch7/200/200', category: 'Documentaries' },
  { name: 'Channel 8', logo: 'https://picsum.photos/seed/ch8/200/200', category: 'Lifestyle' },
  { name: 'Channel 9', logo: 'https://picsum.photos/seed/ch9/200/200', category: 'News' },
  { name: 'Channel 10', logo: 'https://picsum.photos/seed/ch10/200/200', category: 'Sports' },
  { name: 'Channel 11', logo: 'https://picsum.photos/seed/ch11/200/200', category: 'Movies' },
  { name: 'Channel 12', logo: 'https://picsum.photos/seed/ch12/200/200', category: 'Entertainment' },
];

const ChannelCard = ({ channel }: { channel: typeof liveChannels[0] }) => (
  <LoadingLink href="#" className="group block">
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:border-accent">
      <CardContent className="relative aspect-video p-0">
        <Image
          src={channel.logo}
          alt={`${channel.name} logo`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-12 h-12 text-white/80" />
        </div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-white text-lg">{channel.name}</h3>
          <p className="text-sm text-white/70">{channel.category}</p>
        </div>
      </CardContent>
    </Card>
  </LoadingLink>
);


export default function LiveTvPage() {
  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Live TV</h1>
        <p className="text-muted-foreground mt-1">
          Watch your favorite channels live.
        </p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {liveChannels.map((channel) => (
          <ChannelCard key={channel.name} channel={channel} />
        ))}
      </div>
    </div>
  );
}
