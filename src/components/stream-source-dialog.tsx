
'use client';

import { Check, Crown, Gem, Shield, Sparkles, X, Tv } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type StreamSource } from "@/context/theme-provider";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { useTheme } from "@/context/theme-provider";

const sources: { id: StreamSource; name: string; description: string; icon: React.ReactNode; recommended?: boolean }[] = [
  {
    id: "Prime",
    name: "Prime",
    description: "The default source, recommended by Willow.",
    icon: <Crown className="w-6 h-6" />,
    recommended: true,
  },
];

interface StreamSourceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectSource?: (source: StreamSource) => void;
}

export function StreamSourceDialog({ isOpen, onOpenChange, onSelectSource }: StreamSourceDialogProps) {
  const { streamSource, setStreamSource } = useTheme();

  const handleSourceSelect = (source: StreamSource) => {
    if (onSelectSource) {
      onSelectSource(source);
    } else {
      setStreamSource(source);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl border-border/50 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Gem className="w-5 h-5 text-primary" /> Select Stream Source
          </DialogTitle>
          <DialogDescription>
            If one source doesn't work, try another. Performance may vary.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          {sources.map((source) => (
            <div
              key={source.id}
              onClick={() => handleSourceSelect(source.id)}
              className={cn(
                "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center gap-4",
                streamSource === source.id
                  ? "border-primary/80 bg-primary/10 shadow-lg"
                  : "border-muted/50 hover:border-muted hover:bg-muted/50"
              )}
            >
                <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-muted/80",
                    streamSource === source.id && "bg-primary/20 text-primary"
                    )}>
                    {source.icon}
                </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{source.name}</h3>
                    {source.recommended && <Badge variant="secondary" className="border-green-500/50 bg-green-500/10 text-green-400">Recommended</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{source.description}</p>
              </div>
              {streamSource === source.id && (
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
