
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
import Image from 'next/image';
import Link from 'next/link';

const genres = [
  { id: 28, name: 'Action', type: 'movie', image: 'https://images.unsplash.com/photo-1521714161819-15534968fc5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' },
  { id: 35, name: 'Comedy', type: 'all', image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' },
  { id: 878, name: 'Sci-Fi', type: 'movie', image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80' },
  { id: 27, name: 'Horror', type: 'movie', image: 'https://images.unsplash.com/photo-1595843494255-7d5a3a411a7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' },
  { id: 10749, name: 'Romance', type: 'movie', image: 'https://images.unsplash.com/photo-1502422552936-7c381c8153c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' },
  { id: 16, name: 'Animation', type: 'all', image: 'https://images.unsplash.com/photo-1620912189837-55c9b3a3524b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' },
  { id: 99, name: 'Documentary', type: 'all', image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80' },
  { id: 18, name: 'Drama', type: 'all', image: 'https://images.unsplash.com/photo-1601625946892-205e4a50d24f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1849&q=80' },
];

const unique = (arr: Media[]) => {
    const seen = new Set();
    return arr.filter(item => {
        const key = `${item.id}-${item.media_type}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

const GenreCard = ({ genre }: { genre: typeof genres[0] }) => {
  const pathname = usePathname();
  const url = `${pathname}?genre=${genre.id}&genreType=${genre.type}&genreName=${encodeURIComponent(genre.name)}`;

  return (
    <Link href={url} className="group block relative w-full h-40 rounded-lg overflow-hidden shadow-lg">
      <motion.div whileHover="hover" initial="rest" animate="rest" className="relative w-full h-full">
        <motion.div 
            className="absolute inset-0"
            variants={{
                rest: { scale: 1 },
                hover: { scale: 1.1 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <Image
              src={genre.image}
              alt={`${genre.name} genre`}
              fill
              className="object-cover"
            />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <motion.div 
            className="absolute inset-0 bg-black/40 transition-colors"
            variants={{
                rest: { opacity: 0.5 },
                hover: { opacity: 0.2 },
            }}
        />
        
        <motion.div 
          className="absolute -inset-px rounded-lg border-2 border-transparent transition-all duration-300" 
          variants={{
            rest: { borderColor: 'rgba(0,0,0,0)'},
            hover: { 
                borderColor: 'hsl(var(--primary))',
                boxShadow: '0 0 15px hsl(var(--primary) / 0.5)',
            }
          }}
        />

        <motion.h3 
          className="absolute bottom-4 left-4 text-white text-2xl font-bold text-shadow-primary"
          variants={{
            rest: { y: 0 },
            hover: { y: -8 },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {genre.name}
        </motion.h3>
      </motion.div>
    </Link>
  );
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';
  const initialGenreType = searchParams.get('genreType') as 'movie' | 'tv' | 'all' | null;
  const initialGenreName = searchParams.get('genreName') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedGenreName, setSelectedGenreName] = useState(initialGenreName);
  
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

  const performSearch = useCallback(async (query: string, pageToFetch: number) => {
    const isNewSearch = pageToFetch === 1;
    if (isNewSearch) {
      setIsLoading(true);
      setResults([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    setSelectedGenreName('');

    try {
        const data = await searchMedia(query, pageToFetch);
        if (isNewSearch) {
          setResults(data.results);
        } else {
          setResults(prev => unique([...prev, ...data.results]));
        }
        setPage(pageToFetch);
        setTotalPages(data.total_pages);
    } catch {
        setError('Failed to fetch search results.');
    } finally {
        if (isNewSearch) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
    }
  }, []);

  const performGenreSearch = useCallback(async (genreId: string, genreType: 'movie' | 'tv' | 'all', pageToFetch: number) => {
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
    
    try {
        const allResults = await Promise.all(fetchPromises);
        const combinedResults = allResults.flat();
        
        if (isNewSearch) {
            setResults(combinedResults);
        } else {
            setResults(prev => unique([...prev, ...combinedResults]));
        }
        setPage(pageToFetch);
        setTotalPages(pageToFetch + (combinedResults.length > 0 ? 1 : 0));
    } catch {
        setError('Failed to fetch genre results.');
    } finally {
        if (isNewSearch) setIsLoading(false);
        else setIsLoadingMore(false);
    }
  }, []);
  
  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
      performSearch(initialQuery, 1);
    } else if (initialGenre && initialGenreType && initialGenreName) {
      setSelectedGenreName(initialGenreName);
      performGenreSearch(initialGenre, initialGenreType, 1);
    } else {
      setResults([]);
      setTotalPages(0);
      setSearchTerm('');
      setSelectedGenreName('');
    }
  }, [initialQuery, initialGenre, initialGenreType, initialGenreName, performSearch, performGenreSearch]);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      const newUrl = `${pathname}?q=${encodeURIComponent(query)}`;
      router.push(newUrl);
    }
  };

  const loadMore = () => {
    if (page < totalPages && !isLoadingMore) {
        if (initialQuery) {
            performSearch(initialQuery, page + 1);
        } else if (initialGenre && initialGenreType) {
            performGenreSearch(initialGenre, initialGenreType, page + 1);
        }
    }
  };

  const showSkeleton = isLoading && results.length === 0;
  const hasQueryOrGenre = initialQuery || initialGenre;

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

      {selectedGenreName && !isLoading && (
        <h2 className="text-2xl font-bold text-center">Results for "{selectedGenreName}"</h2>
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
      
      {!isLoading && results.length === 0 && hasQueryOrGenre && (
        <p className="text-muted-foreground text-center col-span-full pt-8">
          No results found for "{searchTerm || selectedGenreName}".
        </p>
      )}

      {!hasQueryOrGenre && (
        <div className="text-center pt-8">
            <h2 className="text-xl font-semibold mb-6">Or explore popular genres</h2>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
                            hidden: { opacity: 0, scale: 0.9 },
                            visible: { opacity: 1, scale: 1 }
                        }}
                    >
                        <GenreCard genre={genre} />
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
