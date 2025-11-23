
import { getLiveMatches, getSports } from "@/lib/streamed";
import type { APIMatch, Sport } from "@/types/streamed";
import Image from "next/image";
import LoadingLink from "@/components/loading-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { getStreamedImageUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MatchCard({ match }: { match: APIMatch }) {
    const homeTeam = match.teams?.home;
    const awayTeam = match.teams?.away;

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <LoadingLink href={`/sports/stream/${match.id}`}>
                <CardHeader className="p-0">
                    <div className="relative aspect-video bg-muted">
                        {match.poster ? (
                            <Image 
                                src={getStreamedImageUrl(match.poster)} 
                                alt={match.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                           <div className="flex items-center justify-center h-full">
                               <div className="flex items-center gap-4">
                                {homeTeam?.badge && <Image src={getStreamedImageUrl(homeTeam.badge, 'badge')} alt={homeTeam.name} width={64} height={64} className="object-contain" />}
                                <span className="text-muted-foreground">VS</span>
                                {awayTeam?.badge && <Image src={getStreamedImageUrl(awayTeam.badge, 'badge')} alt={awayTeam.name} width={64} height={64} className="object-contain" />}
                               </div>
                           </div>
                        )}
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <CardTitle className="text-base truncate group-hover:text-primary transition-colors">{match.title}</CardTitle>
                    <div className="flex items-center justify-between mt-2">
                        <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                        <p className="text-xs text-muted-foreground">{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </CardContent>
            </LoadingLink>
        </Card>
    )
}

export default async function SportsPage() {
  const liveMatchesPromise = getLiveMatches();
  const sportsPromise = getSports();

  const [liveMatches, sports] = await Promise.all([liveMatchesPromise, sportsPromise]);
  
  const matchesByCategory = sports.map(sport => ({
      ...sport,
      matches: liveMatches.filter(match => match.category === sport.id)
  })).filter(category => category.matches.length > 0);

  const allTab = { id: 'all', name: 'All', matches: liveMatches };
  const categories = [allTab, ...matchesByCategory];

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Live Sports</h1>
        <p className="text-muted-foreground mt-1">
          Watch live sports matches from around the world.
        </p>
      </header>

      {liveMatches.length === 0 ? (
         <div className="text-center py-16">
            <p className="text-muted-foreground">There are no live matches right now. Please check back later.</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
            <TabsList>
            {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
            ))}
            </TabsList>
            
            {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                    {category.matches.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                            {category.matches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">No live matches for {category.name} right now.</p>
                        </div>
                    )}
                </TabsContent>
            ))}
        </Tabs>
      )}
    </div>
  );
}
