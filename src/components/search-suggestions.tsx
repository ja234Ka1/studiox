
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import type { Media } from '@/types/tmdb';
import { getTmdbImageUrl } from '@/lib/utils';
import LoadingLink from './loading-link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SearchSuggestionsProps {
  children: React.ReactNode;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  suggestions: Media[];
  isLoading: boolean;
  onSearchSubmit: (query: string) => void;
}

export function SearchSuggestions({
  children,
  searchTerm,
  setSearchTerm,
  suggestions,
  isLoading,
  onSearchSubmit,
}: SearchSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const hasSuggestions = suggestions.length > 0;
  const showPopover = !!searchTerm && (hasSuggestions || isLoading);

  useEffect(() => {
    setIsOpen(showPopover);
    if (!showPopover) {
      setActiveIndex(-1);
    }
  }, [showPopover]);
  
  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex !== -1 && suggestions[activeIndex]) {
        // Navigate to the detail page of the selected suggestion
        const selectedItem = suggestions[activeIndex];
        router.push(`/media/${selectedItem.media_type}/${selectedItem.id}`);
        setIsOpen(false);
      } else {
        // Fallback to submitting the search term
        onSearchSubmit(searchTerm);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      {showPopover && (
        <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-2 mt-2" 
            onOpenAutoFocus={(e) => e.preventDefault()} // prevent focus stealing
            onKeyDown={handleKeyDown}
        >
          {isLoading && !hasSuggestions ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Loading suggestions...</p>
          ) : !hasSuggestions ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No suggestions found.</p>
          ) : (
            <ul className="space-y-1">
              {suggestions.map((item, index) => {
                const title = item.title || item.name;
                const year = item.release_date || item.first_air_date
                  ? new Date(item.release_date || item.first_air_date!).getFullYear()
                  : 'N/A';
                
                return (
                    <li key={item.id} onMouseOver={() => setActiveIndex(index)}>
                        <LoadingLink
                        href={`/media/${item.media_type}/${item.id}`}
                        className={cn(
                            "flex items-center gap-4 p-2 rounded-md hover:bg-muted focus:bg-muted focus:outline-none",
                            index === activeIndex && "bg-muted"
                        )}
                        onClick={() => setIsOpen(false)}
                        >
                            <div className="relative w-12 h-16 rounded-sm overflow-hidden flex-shrink-0 bg-muted">
                                <Image
                                src={getTmdbImageUrl(item.poster_path, 'w500')}
                                alt={title || 'poster'}
                                fill
                                className="object-cover"
                                />
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold truncate">{title}</p>
                                <p className="text-sm text-muted-foreground">{year}</p>
                            </div>
                        </LoadingLink>
                    </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
