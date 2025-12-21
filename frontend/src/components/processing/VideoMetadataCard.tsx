"use client";

import { Clock, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { formatDuration } from "@/lib/utils";
import type { VideoMetadata, CacheInfo } from "@/types";

interface VideoMetadataCardProps {
  metadata: VideoMetadata;
  transcript?: string;
  cacheInfo: CacheInfo | null;
  isStreaming: boolean;
  onViewTranscript: () => void;
  onForceReprocess: (e: React.FormEvent) => void;
}

export function VideoMetadataCard({
  metadata,
  transcript,
  cacheInfo,
  isStreaming,
  onViewTranscript,
  onForceReprocess,
}: VideoMetadataCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">
          {metadata.video_title}
        </CardTitle>
        <CardDescription className="space-y-2 text-base">
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Channel:</span>
              <span>{metadata.channel_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Duration:</span>
              <span>{formatDuration(metadata.duration)}</span>
            </div>
            {transcript && (
              <button
                onClick={onViewTranscript}
                className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md border border-primary/20 hover:border-primary/30 transition-all duration-200"
              >
                View Transcript
              </button>
            )}
          </div>
          {/* Cache Indicator and Force Reprocess */}
          {cacheInfo && (
            <div className="flex flex-wrap gap-3 items-center pt-2">
              {cacheInfo.from_cache ? (
                <>
                  <Badge variant="secondary" className="gap-1.5">
                    <Clock className="h-3 w-3" />
                    From cache (<NumberTicker value={cacheInfo.cache_age_hours ?? 0} className="text-inherit" />h ago)
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onForceReprocess}
                    disabled={isStreaming}
                    className="h-7 px-3 text-xs gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Force Reprocess
                  </Button>
                </>
              ) : (
                <Badge variant="default" className="gap-1.5">
                  Freshly processed
                </Badge>
              )}
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
