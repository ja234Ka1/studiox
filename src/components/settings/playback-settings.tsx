
'use client';

import { Play } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const streamingSources = [
  { value: 'vidfast', label: 'Vidfast' },
  { value: 'vidify', label: 'Vidify' },
];

export function PlaybackSettings() {
  const { streamSource, setStreamSource } = useTheme();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Play className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <CardTitle>Playback</CardTitle>
                <CardDescription>Choose your preferred streaming source.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="stream-source-select">Streaming Source</Label>
            <Select
                value={streamSource}
                onValueChange={setStreamSource}
            >
                <SelectTrigger id="stream-source-select">
                    <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                    {streamingSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                            {source.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                Some sources may work better than others.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
