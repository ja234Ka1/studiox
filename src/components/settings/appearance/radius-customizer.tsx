
'use client';

import { Square, Circle } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export function RadiusCustomizer() {
  const { radius, setRadius } = useTheme();

  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Square className="h-6 w-6 rotate-45 text-muted-foreground" />
            </div>
            <div>
                <CardTitle>Corner Rounding</CardTitle>
                <CardDescription>Adjust the roundness of UI elements.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 rounded-md border p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="radius-slider" className="font-medium">
                Radius
              </Label>
              <span className="text-sm text-muted-foreground">
                {(radius * 16).toFixed(0)}px
              </span>
            </div>
            <Slider
              id="radius-slider"
              min={0}
              max={1}
              step={0.1}
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Applies to cards, modals, menus, and more.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRadius(0)} size="sm">
              <Square className="mr-2 h-4 w-4" />
              Square
            </Button>
            <Button variant="outline" onClick={() => setRadius(1)} size="sm">
              <Circle className="mr-2 h-4 w-4" />
              Pill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
