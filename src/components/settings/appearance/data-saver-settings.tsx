
'use client';

import { Gauge } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function DataSaverSettings() {
  const { dataSaver, setDataSaver } = useTheme();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Gauge className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <CardTitle>Data Saver</CardTitle>
                <CardDescription>Manage data usage across the app.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="data-saver-switch" className="font-medium">
              Data Saver Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Reduce image quality and disable video autoplay to save data.
            </p>
          </div>
          <Switch
            id="data-saver-switch"
            checked={dataSaver}
            onCheckedChange={setDataSaver}
          />
        </div>
      </CardContent>
    </Card>
  );
}
