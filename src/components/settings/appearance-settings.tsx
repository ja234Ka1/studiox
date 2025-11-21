"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { theme, setTheme, backgroundEffects, setBackgroundEffects } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
            <Button
              variant={theme === "light" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTheme("light")}
              className={cn(theme === "light" && "bg-background shadow-sm text-foreground")}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTheme("dark")}
              className={cn(theme === "dark" && "bg-background shadow-sm text-foreground")}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTheme("system")}
              className={cn(theme === "system" && "bg-background shadow-sm text-foreground")}
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
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
      </CardContent>
    </Card>
  );
}
