
"use client";

import { Check, Monitor, Gamepad2 } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";

const themes = [
  { name: "dark", label: "Willow", palette: ["#000000", "#ffffff", "#ffffff"] },
  { name: "light", label: "Willow Light", palette: ["#ffffff", "#000000", "#000000"] },
  { name: "theme-rose", label: "Rose", palette: ["#fef2f2", "#e11d48", "#e11d48"] },
  { name: "theme-nintendo", label: "Nintendo", palette: ["#f8f9fa", "#e60012", "#000000"]},
  { name: "theme-playstation", label: "PlayStation Retro", palette: ["#232323", "#0055d4", "#e60012"] },
  { name: "theme-xbox", label: "XBOX Retro", palette: ["#101010", "#107c10", "#9bf00b"] },
];

export function AppearanceSettings() {
  const { theme, setTheme, backgroundEffects, setBackgroundEffects, animationsEnabled, setAnimationsEnabled, blobSpeed, setBlobSpeed } = useTheme();

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your application.
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-muted-foreground" />
            <Label className="text-base">Gaming</Label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {themes.map((t) => (
              <div
                key={t.name}
                className={cn(
                  "relative rounded-lg border-2 p-4 cursor-pointer transition-all",
                  theme === t.name ? "border-primary shadow-lg" : "border-muted/40 hover:border-muted"
                )}
                onClick={() => setTheme(t.name)}
              >
                {theme === t.name && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {t.palette.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-border/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{t.label}</p>
                </div>
              </div>
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

        <Separator />

        <div className="space-y-2">
          <Label>UI Customization</Label>
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex items-center justify-between">
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
                  setBackgroundEffects({ ...backgroundEffects, blobs: checked })
                }
              />
            </div>
            {backgroundEffects.blobs && (
              <div className="space-y-3 pl-2">
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
                  setBackgroundEffects({ ...backgroundEffects, starfield: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
