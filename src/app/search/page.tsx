
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { Media } from '@/types/tmdb';
import { searchMedia } from '@/lib/tmdb';
import { MediaCard } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from 'use-debounce';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field on page load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const newUrl = debouncedSearchTerm ? `${pathname}?q=${encodeURIComponent(debouncedSearchTerm)}` : pathname;
    router.replace(newUrl, { scroll: false });

    if (debouncedSearchTerm) {
      setIsLoading(true);
      setResults([]);
      setPage(1);
      setError(null);
      searchMedia(debouncedSearchTerm, 1)
        .then(data => {
          setResults(data.results);
          setTotalPages(data.total_pages);
        })
        .catch(() => setError('Failed to fetch search results.'))
        .finally(() => setIsLoading(false));
    } else {
      setResults([]);
      setTotalPages(0);
    }
  }, [debouncedSearchTerm, pathname, router]);

  const loadMore = () => {
    if (debouncedSearchTerm && page < totalPages) {
      setIsLoading(true);
      searchMedia(debouncedSearchTerm, page + 1)
        .then(data => {
          setResults(prev => [...prev, ...data.results]);
          setPage(page + 1);
        })
        .catch(() => setError('Failed to load more results.'))
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-8 py-12 pb-24 mx-auto">
      <div className="relative w-full max-w-xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search for movies, TV shows..."
          className="pl-12 h-12 text-lg rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive text-center">{error}</p>}

      {isLoading && results.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full">
                <Skeleton className="w-full h-full" />
                </div>
            ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {results.map(item => <MediaCard key={item.id} item={item} />)}
        </div>
      )}

      {!isLoading && results.length === 0 && debouncedSearchTerm && (
        <p className="text-muted-foreground text-center col-span-full pt-8">
          No results found for "{debouncedSearchTerm}".
        </p>
      )}

      {!isLoading && !debouncedSearchTerm && (
        <p className="text-muted-foreground text-center col-span-full pt-8">
            Start typing to search for content.
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
