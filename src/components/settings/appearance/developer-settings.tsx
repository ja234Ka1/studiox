
'use client';

import { TestTube2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingLink from '@/components/loading-link';

export function DeveloperSettings() {

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <TestTube2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>Tools for testing and debugging the application.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">
              UI Stress Test
            </p>
            <p className="text-xs text-muted-foreground">
              Render a large number of components to check for performance bottlenecks.
            </p>
          </div>
          <Button asChild>
            <LoadingLink href="/stresstest">
                Run Test
            </LoadingLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
