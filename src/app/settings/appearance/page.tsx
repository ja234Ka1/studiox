
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => (
  <Skeleton className="h-48 w-full" />
);

const ThemeSelector = dynamic(() => 
  import('@/components/settings/appearance/theme-selector').then(mod => mod.ThemeSelector), 
  { loading: () => <LoadingSkeleton /> }
);
const RadiusCustomizer = dynamic(() => 
  import('@/components/settings/appearance/radius-customizer').then(mod => mod.RadiusCustomizer),
  { loading: () => <LoadingSkeleton /> }
);
const InterfaceSettings = dynamic(() => 
  import('@/components/settings/appearance/interface-settings').then(mod => mod.InterfaceSettings),
  { loading: () => <LoadingSkeleton /> }
);
const DataSaverSettings = dynamic(() => 
  import('@/components/settings/appearance/data-saver-settings').then(mod => mod.DataSaverSettings),
  { loading: () => <LoadingSkeleton /> }
);


export default function SettingsAppearancePage() {
  return (
    <div className="space-y-6">
      <ThemeSelector />
      <RadiusCustomizer />
      <InterfaceSettings />
      <DataSaverSettings />
    </div>
  );
}
