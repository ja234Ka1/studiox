'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface Quote {
  anime: string;
  character: string;
  quote: string;
}

const QuoteSkeleton = () => (
  <Card className="bg-muted/30">
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/4" />
      <div className="flex justify-between items-end">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);

export function AnimeQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://animechan.xyz/api/random');
      if (!response.ok) {
        throw new Error('Failed to fetch quote from Animechan API.');
      }
      const data: Quote = await response.json();
      setQuote(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (isLoading) {
    return <QuoteSkeleton />;
  }
  
  if (error) {
    return (
        <div className='container px-4 md:px-8'>
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Could not load quote</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  if (!quote) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 md:px-8"
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            Quote of the Moment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quote.quote}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="border-l-4 border-accent pl-4 text-lg italic"
            >
              "{quote.quote}"
            </motion.blockquote>
          </AnimatePresence>
          <div className="flex justify-between items-end">
            <AnimatePresence mode="wait">
              <motion.footer
                key={quote.character}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-right text-sm text-muted-foreground"
              >
                — {quote.character}
                <cite className="block not-italic">({quote.anime})</cite>
              </motion.footer>
            </AnimatePresence>
            <Button variant="secondary" onClick={fetchQuote} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              New Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
