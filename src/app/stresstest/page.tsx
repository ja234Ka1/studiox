
'use client';

import { useState, useTransition } from 'react';
import { getDiscover } from '@/lib/tmdb';
import type { Media } from '@/types/tmdb';
import { MediaCard } from '@/components/media-card';
import { Button } from '@/components/ui/button';
import { Loader2, TestTube2, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from 'framer-motion';

const itemCounts = [50, 100, 200, 500];

export default function StressTestPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number>(100);
  const [isPending, startTransition] = useTransition();

  const runTest = async () => {
    setIsLoading(true);
    setItems([]);
    setError(null);

    const pagesToFetch = Math.ceil(itemCount / 20);
    const promises = Array.from({ length: pagesToFetch }, (_, i) => 
        getDiscover('movie', { page: String(i + 1), sort_by: 'popularity.desc' })
    );

    try {
      const results = await Promise.all(promises);
      const allItems = results.flat().slice(0, itemCount);
      
      // Use useTransition to prevent the UI from freezing during the large render
      startTransition(() => {
        setItems(allItems);
      });

    } catch (e: any) {
      setError(e.message || 'Failed to fetch data. Check your API key and network.');
    } finally {
      setIsLoading(false);
    }
  };

  const isTestRunning = isLoading || isPending;

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 pb-24">
      <header className="mb-8 text-center">
        <TestTube2 className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold tracking-tight">UI Stress Test</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
          This tool fetches and renders a large number of media cards to help identify performance issues and UI bottlenecks.
        </p>
      </header>

      <div className="mx-auto max-w-md bg-card p-6 rounded-lg border shadow-md flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <div className='flex items-center gap-2'>
            <label htmlFor="item-count" className="font-medium text-sm whitespace-nowrap">Number of Items:</label>
            <Select
                value={String(itemCount)}
                onValueChange={(val) => setItemCount(Number(val))}
                disabled={isTestRunning}
            >
                <SelectTrigger className="w-[120px]" id="item-count">
                    <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                    {itemCounts.map(count => (
                        <SelectItem key={count} value={String(count)}>{count}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={runTest} disabled={isTestRunning} className="w-full sm:w-auto">
          {isTestRunning ? (
            <>
              <Loader2 className="animate-spin" />
              <span>{isLoading ? 'Fetching...' : 'Rendering...'}</span>
            </>
          ) : (
            'Run Test'
          )}
        </Button>
      </div>

      {error && (
        <div className="text-destructive text-center bg-destructive/10 border border-destructive/50 p-4 rounded-md">
            <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
            <p className="font-bold">An Error Occurred</p>
            <p className="text-sm">{error}</p>
        </div>
      )}

      {items.length > 0 && (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-center">
                Rendering {items.length} items
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                <AnimatePresence>
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id + '-' + i}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.01 }}
                        >
                            <MediaCard item={item} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
      )}

    </div>
  );
}
