
'use client'

import { useEffect, useState, useMemo } from "react";
import { getChannels, getCategories } from "@/lib/iptv-api";
import type { IptvChannel, IptvCategory } from "@/types/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategorySection } from "@/components/iptv/category-section";

function ChannelGridSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full" />
        ))}
      </div>
    </>
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
        
        const categoryIds = new Set(categoriesData.map(c => c.id));
        const relevantChannels = channelsData.filter(channel => 
            channel.categories.some(catId => categoryIds.has(catId)) &&
            !channel.is_nsfw
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

  const filteredChannels = useMemo(() => {
    if (!searchTerm) return channels;
    return channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [channels, searchTerm]);
  
  const channelsByCategory = useMemo(() => {
    return categories.map(category => ({
      ...category,
      channels: channels.filter(channel => 
        channel.categories.includes(category.id)
      )
    })).filter(category => category.channels.length > 0);
  }, [categories, channels]);


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
                type="search"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
            />
        </div>
      </header>

      {isLoading && (
        <div className="space-y-12">
            <ChannelGridSkeleton />
            <ChannelGridSkeleton />
        </div>
      )}

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
             <CategorySection title={`Search results for "${searchTerm}"`} channels={filteredChannels} />
           ) : (
            channelsByCategory.map((category, index) => (
                <CategorySection key={category.id} title={category.name} channels={category.channels} delay={index * 0.1} />
            ))
           )}
        </div>
      )}
    </div>
  );
}
