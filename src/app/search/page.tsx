

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Media } from '@/types/tmdb';
import { searchMedia, getDiscover } from '@/lib/tmdb';
import { MediaCard } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const genres = [
  { id: 28, name: 'Action', type: 'movie' },
  { id: 10759, name: 'Action & Adventure', type: 'tv' },
  { id: 12, name: 'Adventure', type: 'movie' },
  { id: 16, name: 'Animation', type: 'all' },
  { id: 35, name: 'Comedy', type: 'all' },
  { id: 80, name: 'Crime', type: 'all' },
  { id: 99, name: 'Documentary', type: 'all' },
  { id: 18, name: 'Drama', type: 'all' },
  { id: 10751, name: 'Family', type: 'all' },
  { id: 14, name: 'Fantasy', type: 'movie' },
  { id: 36, name: 'History', type: 'all' },
  { id: 27, name: 'Horror', type: 'movie' },
  { id: 10762, name: 'Kids', type: 'tv' },
  { id: 10402, name: 'Music', type: 'all' },
  { id: 9648, name: 'Mystery', type: 'all' },
  { id: 10763, name: 'News', type: 'tv' },
  { id: 10764, name: 'Reality', type: 'tv' },
  { id: 10749, name: 'Romance', type: 'movie' },
  { id: 10765, name: 'Sci-Fi & Fantasy', type: 'tv' },
  { id: 878, name: 'Science Fiction', type: 'movie' },
  { id: 10766, name: 'Soap', type: 'tv' },
  { id: 10767, name: 'Talk', type: 'tv' },
  { id: 53, name: 'Thriller', type: 'movie' },
  { id: 10770, name: 'TV Movie', type: 'movie' },
  { id: 10752, name: 'War', type: 'movie' },
  { id: 10768, name: 'War & Politics', type: 'tv' },
  { id: 37, name: 'Western', type: 'movie' },
];


const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  
  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

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
    setSelectedGenre('');

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

  const performGenreSearch = useCallback((genreId: string, genreType: 'movie' | 'tv' | 'all', pageToFetch: number) => {
    const isNewSearch = pageToFetch === 1;
    if (isNewSearch) {
      setIsLoading(true);
      setResults([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    const fetchPromises = genreType === 'all' 
        ? [getDiscover('movie', { with_genres: genreId, page: String(pageToFetch) }), getDiscover('tv', { with_genres: genreId, page: String(pageToFetch) })]
        : [getDiscover(genreType, { with_genres: genreId, page: String(pageToFetch) })]
    
    Promise.all(fetchPromises)
        .then(allResults => {
            const combinedResults = allResults.flat();
            
            if (isNewSearch) {
                setResults(combinedResults);
            } else {
                setResults(prev => [...prev, ...combinedResults]);
            }

            setPage(pageToFetch);
            // This is not accurate for combined results, but gives basic load more functionality
            setTotalPages(pageToFetch + (combinedResults.length > 0 ? 1 : 0));
        })
        .catch(() => setError('Failed to fetch genre results.'))
        .finally(() => {
            if (isNewSearch) setIsLoading(false);
            else setIsLoadingMore(false);
        })
  }, []);
  
  useEffect(() => {
    const query = searchParams.get('q');
    const genreId = searchParams.get('genre');
    const genreType = searchParams.get('genreType') as 'movie' | 'tv' | 'all';
    const genreName = searchParams.get('genreName');

    if (query) {
      setSearchTerm(query);
      performSearch(query, 1);
    } else if (genreId && genreType && genreName) {
      setSelectedGenre(genreName);
      performGenreSearch(genreId, genreType, 1);
    } else {
      setResults([]);
      setTotalPages(0);
      setSearchTerm('');
      setSelectedGenre('');
    }
  }, [searchParams, performSearch, performGenreSearch]);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      const newUrl = `${pathname}?q=${encodeURIComponent(query)}`;
      router.push(newUrl);
    }
  };

  const handleGenreClick = (genre: { id: number, name: string, type: 'movie' | 'tv' | 'all' }) => {
    const newUrl = `${pathname}?genre=${genre.id}&genreType=${genre.type}&genreName=${encodeURIComponent(genre.name)}`;
    router.push(newUrl);
  };


  const loadMore = () => {
    const query = searchParams.get('q');
    const genreId = searchParams.get('genre');
    const genreType = searchParams.get('genreType') as 'movie' | 'tv' | 'all';

    if (query && page < totalPages && !isLoadingMore) {
      performSearch(query, page + 1);
    } else if (genreId && genreType && page < totalPages && !isLoadingMore) {
        performGenreSearch(genreId, genreType, page + 1);
    }
  };

  const showSkeleton = isLoading && results.length === 0;
  const hasQuery = searchParams.get('q') || searchParams.get('genre');

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-8 py-12 pb-24 mx-auto">
      <div className="relative w-full max-w-xl mx-auto">
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
          </div>
      </div>

      {selectedGenre && !isLoading && (
        <h2 className="text-2xl font-bold text-center">Results for "{selectedGenre}"</h2>
      )}
      
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
          {results.map(item => <MediaCard key={`${item.id}-${item.media_type}`} item={item} />)}
        </div>
      )}
      
      {!isLoading && results.length === 0 && hasQuery && (
        <p className="text-muted-foreground text-center col-span-full pt-8">
          No results found for "{searchTerm || selectedGenre}".
        </p>
      )}

      {!isLoading && !hasQuery && (
        <div className="text-center pt-8">
            <h2 className="text-xl font-semibold mb-6">Or discover by genre</h2>
            <motion.div 
                className="flex flex-wrap justify-center gap-3"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}
            >
                {genres.map(genre => (
                    <motion.div
                        key={genre.id + genre.type}
                        variants={{
                            hidden: { opacity: 0, scale: 0.8 },
                            visible: { opacity: 1, scale: 1 }
                        }}
                    >
                        <Button 
                            variant="outline"
                            className="rounded-full border-muted-foreground/30 hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-300"
                            onClick={() => handleGenreClick(genre)}
                        >
                            {genre.name}
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      )}

      {page < totalPages && !isLoadingMore && results.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Loader2 className="animate-spin" /> : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
