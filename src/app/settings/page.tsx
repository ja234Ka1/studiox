import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 md:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your Willow experience.
        </p>
      </header>
      <Separator className="mb-8" />
      <div className="space-y-12">
        <AppearanceSettings />
        {/* Other settings sections can be added here */}
      </div>
    </div>
  );
}
