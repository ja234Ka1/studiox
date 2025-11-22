
import { getSports, getLiveMatches, getMatches, getPopularMatches, getImageUrl } from "@/lib/streamed-api";
import type { StreamedSport, StreamedMatch, StreamedMatchWithEncodedSources } from "@/types/tmdb";
import { format } from 'date-fns';
import Image from "next/image";
import Link from 'next/link';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const MatchCard = ({ match }: { match: StreamedMatch }) => {
    // The match object needs to be modified to be passed as a search param
    const matchWithEncodedSource: StreamedMatchWithEncodedSources = {
        ...match,
        sources: JSON.stringify(match.sources)
    }

    return (
        <Link 
            href={{
                pathname: `/live-tv/${match.id}`,
                query: matchWithEncodedSource,
            }}
            className="block group"
        >
            <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:border-accent bg-card h-full flex flex-col">
                <CardHeader className="p-4">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 truncate">
                           {match.teams?.home?.badge && (
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <Image src={getImageUrl(match.teams.home.badge)} alt={match.teams.home.name} fill className="object-contain" />
                                </div>
                            )}
                            <span className="font-semibold truncate text-sm">{match.teams?.home?.name || ''}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">VS</Badge>
                         <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold truncate text-sm text-right">{match.teams?.away?.name || ''}</span>
                           {match.teams?.away?.badge && (
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <Image src={getImageUrl(match.teams.away.badge)} alt={match.teams.away.name} fill className="object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center flex-grow">
                     <p className="text-sm font-bold truncate group-hover:text-accent transition-colors">{match.title}</p>
                     <p className="text-xs text-muted-foreground mt-1">{match.category}</p>
                </CardContent>
                <CardFooter className="p-2 bg-muted/50 text-xs text-muted-foreground justify-center">
                    <time dateTime={new Date(match.date).toISOString()}>
                        {format(new Date(match.date), "MMM d, h:mm a")}
                    </time>
                </CardFooter>
            </Card>
        </Link>
    );
};

const MatchCategory = ({ title, matches }: { title: string, matches: StreamedMatch[] }) => {
    if (matches.length === 0) return null;
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {matches.map(match => <MatchCard key={match.id} match={match} />)}
            </div>
        </div>
    );
}

export default async function LiveTvPage() {
    const sports = await getSports();
    const liveMatches = await getLiveMatches();
    const popularMatches = await getPopularMatches();

    const sportTabs = ['football', 'basketball', 'tennis', 'hockey', 'baseball', 'mma', 'boxing'];
    const sportsToShow = sports.filter(s => sportTabs.includes(s.id));

    const matchesBySport: Record<string, StreamedMatch[]> = {};
    for (const sport of sportsToShow) {
        matchesBySport[sport.id] = await getMatches(sport.id);
    }
    
    return (
        <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
             <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tighter">Live Sports</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Watch live matches from around the world. Select a category or browse all available events.
                </p>
            </header>

            <Tabs defaultValue="overview">
                <div className="flex justify-center mb-8">
                     <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        {sportsToShow.map(sport => (
                            <TabsTrigger key={sport.id} value={sport.id}>
                                {sport.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-12">
                    <MatchCategory title="Live Now" matches={liveMatches} />
                    <Separator />
                    <MatchCategory title="Popular Today" matches={popularMatches} />
                </TabsContent>

                {sportsToShow.map(sport => (
                    <TabsContent key={sport.id} value={sport.id}>
                        <MatchCategory title={`${sport.name} Matches`} matches={matchesBySport[sport.id] || []} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
