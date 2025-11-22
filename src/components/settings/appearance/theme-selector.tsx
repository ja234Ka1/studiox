
'use client';

import { Check, Monitor, Palette } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const themes = [
  { name: 'dark', label: 'Willow', palette: ['#000000', '#ffffff', '#ffffff'] },
  { name: 'light', label: 'Willow Light', palette: ['#ffffff', '#000000', '#000000'] },
  { name: 'theme-rose', label: 'Rose', palette: ['#fef2f2', '#e11d48', '#e11d48'] },
  { name: 'theme-nintendo', label: 'Nintendo', palette: ['#f8f9fa', '#e60012', '#000000'] },
  { name: 'theme-playstation', label: 'PlayStation', palette: ['#232323', '#0055d4', '#e60012'] },
  { name: 'theme-xbox', label: 'XBOX', palette: ['#101010', '#107c10', '#9bf00b'] },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Palette className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select a theme for the application.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {themes.map((t) => (
            <motion.div
              key={t.name}
              className={cn(
                'relative rounded-lg border-2 p-4 cursor-pointer transition-all',
                theme === t.name ? 'border-primary shadow-md' : 'border-muted/40 hover:border-muted'
              )}
              onClick={() => setTheme(t.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === t.name && (
                <motion.div 
                    layoutId="theme-check"
                    className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {t.palette.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-border/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="font-semibold text-sm">{t.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-lg border p-2 bg-muted/50">
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className={cn('w-full', theme === 'system' && 'bg-background shadow-sm text-foreground')}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Sync with System
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
