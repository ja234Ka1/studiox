
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Media } from '@/types/tmdb';
import { searchMedia } from '@/lib/tmdb';
import { MediaCard } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setResults([]);
      setPage(1);
      setError(null);
      searchMedia(query, 1)
        .then(data => {
          setResults(data.results);
          setTotalPages(data.total_pages);
        })
        .catch(() => setError('Failed to fetch search results.'))
        .finally(() => setIsLoading(false));
    }
  }, [query]);

  const loadMore = () => {
    if (query && page < totalPages) {
      setIsLoading(true);
      searchMedia(query, page + 1)
        .then(data => {
          setResults(prev => [...prev, ...data.results]);
          setPage(page + 1);
        })
        .catch(() => setError('Failed to load more results.'))
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        {results.length > 0 && (
            <p className="text-muted-foreground mt-1">
                Showing {results.length} results
            </p>
        )}
      </header>

      {error && <p className="text-destructive">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {isLoading && results.length === 0
          ? Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] w-full">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          : results.map(item => <MediaCard key={item.id} item={item} />)}
      </div>

      {!isLoading && results.length === 0 && query && (
        <p className="text-muted-foreground text-center col-span-full">
          No results found for "{query}". Try a different search.
        </p>
      )}

      {page < totalPages && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
