
'use client';

import { ThemeSelector } from '@/components/settings/appearance/theme-selector';
import { RadiusCustomizer } from '@/components/settings/appearance/radius-customizer';
import { InterfaceSettings } from '@/components/settings/appearance/interface-settings';
import { DataSaverSettings } from '@/components/settings/appearance/data-saver-settings';
import { DeveloperSettings } from '@/components/settings/appearance/developer-settings';

export default function SettingsAppearancePage() {
  return (
    <div className="space-y-6">
      <ThemeSelector />
      <RadiusCustomizer />
      <InterfaceSettings />
      <DataSaverSettings />
      <DeveloperSettings />
    </div>
  );
}
