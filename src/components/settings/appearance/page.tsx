
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-48 w-full" />
  </div>
);

const ThemeSelector = dynamic(() => 
  import('@/components/settings/appearance/theme-selector').then(mod => mod.ThemeSelector), 
  { loading: () => <Skeleton className="h-48 w-full" /> }
);
const RadiusCustomizer = dynamic(() => 
  import('@/components/settings/appearance/radius-customizer').then(mod => mod.RadiusCustomizer),
  { loading: () => <Skeleton className="h-32 w-full" /> }
);
const InterfaceSettings = dynamic(() => 
  import('@/components/settings/appearance/interface-settings').then(mod => mod.InterfaceSettings),
  { loading: () => <Skeleton className="h-48 w-full" /> }
);
const DataSaverSettings = dynamic(() => 
  import('@/components/settings/appearance/data-saver-settings').then(mod => mod.DataSaverSettings),
  { loading: () => <Skeleton className="h-32 w-full" /> }
);


export function SettingsAppearancePage() {
  return (
    <div className="space-y-4">
      <ThemeSelector />
      <RadiusCustomizer />
      <InterfaceSettings />
      <DataSaverSettings />
    </div>
  );
}
