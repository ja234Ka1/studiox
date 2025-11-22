
"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { name: "light", label: "Light", icon: Sun, accentColor: "hsl(45 90% 55%)" },
  { name: "dark", label: "Willow", icon: Moon, accentColor: "hsl(0 0% 100%)" },
  { name: "theme-rose", label: "Rose", accentColor: "hsl(346.8 77.2% 49.8%)" },
];

export function AppearanceSettings() {
  const { theme, setTheme, backgroundEffects, setBackgroundEffects } = useTheme();

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your application.
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Color Scheme</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map((t) => (
              <Button
                key={t.name}
                variant={"outline"}
                className={cn(
                  "justify-start h-12",
                  theme === t.name && "border-2 border-primary"
                )}
                onClick={() => setTheme(t.name)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: t.accentColor }}
                />
                <span className="flex-1 text-left">{t.label}</span>
                {theme === t.name && <Check className="h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>System Preference</Label>
           <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
             <Button
              variant={theme === "system" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTheme("system")}
              className={cn("col-span-3", theme === "system" && "bg-background shadow-sm text-foreground")}
            >
              <Monitor className="mr-2 h-4 w-4" />
              Sync with System
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Background Effects</Label>
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex items-center justify-between">
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
                  setBackgroundEffects({ blobs: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
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
                  setBackgroundEffects({ starfield: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    