
'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { getChannels, getCategories } from "@/lib/iptv-api";
import type { IptvChannel, IptvCategory } from "@/types/tmdb";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingLink from "@/components/loading-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import { Input } from "@/components/ui/input";

function ChannelCard({ channel }: { channel: IptvChannel }) {
  return (
    <LoadingLink href={`/live-tv/${channel.id}`}>
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:border-accent bg-card h-full flex flex-col">
        <CardContent className="relative aspect-video p-0 flex items-center justify-center bg-zinc-900/50">
          {channel.logo ? (
            <Image
              src={channel.logo}
              alt={`${channel.name} logo`}
              width={120}
              height={120}
              className="object-contain w-auto h-auto max-h-[80px]"
            />
          ) : (
            <span className="text-muted-foreground text-xs">No Logo</span>
          )}
        </CardContent>
        <CardFooter className="p-3 flex-grow flex items-center justify-center">
            <h3 className="font-semibold text-center text-sm truncate">{channel.name}</h3>
        </CardFooter>
      </Card>
    </LoadingLink>
  )
}

function ChannelGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {Array.from({ length: 16 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/3] w-full" />
      ))}
    </div>
  );
}

export default function LiveTvPage() {
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [categories, setCategories] = useState<IptvCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [channelsData, categoriesData] = await Promise.all([
          getChannels(),
          getCategories(),
        ]);
        
        // Filter out channels that don't belong to any fetched category
        const categoryIds = new Set(categoriesData.map(c => c.id));
        const relevantChannels = channelsData.filter(channel => 
            channel.categories.some(catId => categoryIds.has(catId))
        );

        setChannels(relevantChannels);
        setCategories(categoriesData);
      } catch (e) {
        setError("Failed to load channel data. Please try again later.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredChannels = searchTerm
    ? channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : channels;

  const channelsByCategory = categories.map(category => ({
    ...category,
    channels: filteredChannels.filter(channel => 
      channel.categories.includes(category.id) && channel.is_nsfw === false
    )
  })).filter(category => category.channels.length > 0);


  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live TV</h1>
          <p className="text-muted-foreground mt-1">
            Browse live channels from around the world.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
            <Input 
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
            />
        </div>
      </header>

      {isLoading && <ChannelGridSkeleton />}

      {error && !isLoading && (
        <Alert variant="destructive">
          <Clapperboard className="h-4 w-4" />
          <AlertTitle>Error Loading Channels</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="space-y-12">
           {searchTerm ? (
             filteredChannels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredChannels.map(channel => <ChannelCard key={channel.id} channel={channel} />)}
                </div>
             ) : (
                <p className="text-muted-foreground text-center">No channels found for "{searchTerm}".</p>
             )
           ) : (
            channelsByCategory.map(category => (
                <section key={category.id}>
                  <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {category.channels.map(channel => (
                      <ChannelCard key={channel.id} channel={channel} />
                    ))}
                  </div>
                </section>
              ))
           )}
        </div>
      )}
    </div>
  );
}
