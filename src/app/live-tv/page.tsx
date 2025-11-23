
import { ChannelGuide } from "@/components/channel-guide";
import { getDiscover } from "@/lib/tmdb";
import type { Media } from "@/types/tmdb";

const channels = [
    { name: "Action & Adventure", params: { with_genres: '10759' } },
    { name: "Animation", params: { with_genres: '16' } },
    { name: "Comedy", params: { with_genres: '35' } },
    { name: "Crime", params: { with_genres: '80' } },
    { name: "Documentary", params: { with_genres: '99' } },
    { name: "Drama", params: { with_genres: '18' } },
    { name: "Family", params: { with_genres: '10751' } },
    { name: "Kids", params: { with_genres: '10762' } },
    { name: "Mystery", params: { with_genres: '9648' } },
    { name: "Sci-Fi & Fantasy", params: { with_genres: '10765' } },
    { name: "Reality", params: { with_genres: '10764' } },
    { name: "Talk", params: { with_genres: '10767' } },
];

export default async function LiveTvPage() {

    const channelDataPromises = channels.map(channel => 
        getDiscover('tv', { ...channel.params, language: 'en-US' })
    );
    
    const channelDataResults = await Promise.allSettled(channelDataPromises);

    const populatedChannels = channels.map((channel, index) => {
        const result = channelDataResults[index];
        if (result.status === 'fulfilled' && result.value.length > 0) {
            return {
                name: channel.name,
                shows: result.value as Media[],
            };
        }
        return { name: channel.name, shows: [] };
    }).filter(c => c.shows.length > 0);


    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
             <header className="px-4 md:px-8 py-6 mb-0">
                <h1 className="text-3xl font-bold tracking-tight">Live TV</h1>
                <p className="text-muted-foreground mt-1">
                    An interactive guide to discover shows by genre.
                </p>
            </header>
            <div className="flex-grow overflow-hidden">
               <ChannelGuide channels={populatedChannels} />
            </div>
        </div>
    );
}
