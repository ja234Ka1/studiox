
'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export function InterfaceSettings() {
  const {
    backgroundEffects,
    setBackgroundEffects,
    animationsEnabled,
    setAnimationsEnabled,
    blobSpeed,
    setBlobSpeed,
  } = useTheme();

  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
                <CardTitle className="text-xl">Interface &amp; Animations</CardTitle>
                <CardDescription>Customize the user interface and motion effects.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="animations-switch" className="font-medium">
              UI Animations
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable or disable animations throughout the app.
            </p>
          </div>
          <Switch
            id="animations-switch"
            checked={animationsEnabled}
            onCheckedChange={setAnimationsEnabled}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="blobs-switch" className="font-medium">
              Animated Blobs
            </Label>
            <p className="text-xs text-muted-foreground">
              Slowly moving gradients in the background.
            </p>
          </div>
          <Switch
            id="blobs-switch"
            checked={backgroundEffects.blobs}
            onCheckedChange={(checked) =>
              setBackgroundEffects({ ...backgroundEffects, blobs: checked })
            }
          />
        </div>
        {backgroundEffects.blobs && (
            <div className="space-y-4 rounded-lg border p-4">
                <Label htmlFor="blob-speed-slider">Blob Animation Speed</Label>
                <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Slow</span>
                <Slider
                    id="blob-speed-slider"
                    min={5}
                    max={60}
                    step={5}
                    value={[65 - blobSpeed]}
                    onValueChange={(value) => setBlobSpeed(65 - value[0])}
                    className="w-full"
                />
                <span className="text-xs text-muted-foreground">Fast</span>
                </div>
          </div>
        )}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="starfield-switch" className="font-medium">
              Starfield
            </Label>
            <p className="text-xs text-muted-foreground">
              A subtle starfield effect for extra depth (dark mode only).
            </p>
          </div>
          <Switch
            id="starfield-switch"
            checked={backgroundEffects.starfield}
            onCheckedChange={(checked) =>
              setBackgroundEffects({ ...backgroundEffects, starfield: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
