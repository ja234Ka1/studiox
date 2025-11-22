
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Media } from '@/types/tmdb';
import { searchMedia } from '@/lib/tmdb';
import { MediaCard } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { SearchSuggestions } from '@/components/search-suggestions';


const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const [results, setResults] = useState<Media[]>([]);
  const [suggestions, setSuggestions] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  
  // This ref helps to distinguish between a search triggered by submitting
  // the input vs. one triggered by the debounced search term changing.
  const submittedSearchTermRef = useRef<string | null>(initialQuery);


  // Focus the input field on page load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback((query: string, pageToFetch: number) => {
    const isNewSearch = pageToFetch === 1;
    if (isNewSearch) {
      setIsLoading(true);
      setResults([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    searchMedia(query, pageToFetch)
      .then(data => {
        if (isNewSearch) {
          setResults(data.results);
        } else {
          setResults(prev => [...prev, ...data.results]);
        }
        setPage(pageToFetch);
        setTotalPages(data.total_pages);
      })
      .catch(() => setError('Failed to fetch search results.'))
      .finally(() => {
        if (isNewSearch) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      });
  }, []);
  
  // Effect for fetching suggestions as user types
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm !== submittedSearchTermRef.current) {
        setIsSuggestionsLoading(true);
        searchMedia(debouncedSearchTerm, 1, 8) // Fetch a small number for suggestions
            .then(data => {
                setSuggestions(data.results);
            })
            .catch(() => {
                setSuggestions([]);
            })
            .finally(() => {
                setIsSuggestionsLoading(false);
            });
    } else {
        setSuggestions([]);
    }
  }, [debouncedSearchTerm]);


  // Effect for fetching full search results when the query is submitted
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      performSearch(query, 1);
    } else {
      setResults([]);
      setTotalPages(0);
    }
  }, [searchParams, performSearch]);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      submittedSearchTermRef.current = query;
      setSuggestions([]); // Hide suggestions on submit
      const newUrl = `${pathname}?q=${encodeURIComponent(query)}`;
      router.push(newUrl); // Use push to add to history
    }
  };

  const loadMore = () => {
    const query = searchParams.get('q');
    if (query && page < totalPages && !isLoadingMore) {
      performSearch(query, page + 1);
    }
  };

  const showSkeleton = isLoading && results.length === 0;

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-8 py-12 pb-24 mx-auto">
      <div className="relative w-full max-w-xl mx-auto">
        <SearchSuggestions
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          onSearchSubmit={handleSearchSubmit}
        >
          <div className="relative w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search for movies, TV shows..."
              className="pl-12 h-12 text-lg rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleSearchSubmit(e.currentTarget.value)
                }
              }}
            />
            {isSuggestionsLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
            )}
          </div>
        </SearchSuggestions>
      </div>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      {showSkeleton && (
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
      
      {!isLoading && results.length === 0 && searchParams.get('q') && (
        <p className="text-muted-foreground text-center col-span-full pt-8">
          No results found for "{searchParams.get('q')}".
        </p>
      )}

      {!isLoading && !searchParams.get('q') && (
        <p className="text-muted-foreground text-center col-span-full pt-8">
            Start typing to search for content.
        </p>
      )}

      {page < totalPages && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
