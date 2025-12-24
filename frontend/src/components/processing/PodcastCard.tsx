"use client";

import { useState } from "react";
import { Mic, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "./AudioPlayer";
import type { Concept, PodcastEpisode, PodcastDialogue } from "@/types";

interface PodcastCardProps {
  concepts: Concept[];
  lectureNotes: string;
  videoTitle: string;
}

// Fun loading messages for podcast generation
const LOADING_MESSAGES = [
  "Alex and Jordan are warming up...",
  "Brewing some coffee for the hosts...",
  "Reviewing the lecture notes...",
  "Setting up the microphones...",
  "Getting into character...",
  "Practicing their radio voices...",
];

export function PodcastCard({ concepts, lectureNotes, videoTitle }: PodcastCardProps) {
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  // Rotate loading messages
  const startLoadingMessages = () => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 3000);
    return interval;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    const messageInterval = startLoadingMessages();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/podcast/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepts: concepts,
          lecture_notes: lectureNotes,
          video_title: videoTitle,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setEpisode(data.data);
      } else {
        setError(data.error || "Failed to generate podcast");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  };

  // Format duration as M:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render dialogue transcript
  const renderTranscript = (dialogue: PodcastDialogue[]) => {
    return dialogue.map((line, index) => (
      <div key={index} className="flex gap-3 py-2">
        <div
          className={`font-semibold min-w-[60px] ${
            line.speaker === "Alex" ? "text-blue-500" : "text-purple-500"
          }`}
        >
          {line.speaker}:
        </div>
        <div className="text-foreground/80">{line.text}</div>
      </div>
    ));
  };

  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          Audio Overview
          <span className="text-3xl">🎙️</span>
        </CardTitle>
        <CardDescription className="text-base">
          Listen to Alex and Jordan discuss the key concepts from this lecture.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Not generated state */}
        {!episode && !isGenerating && (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Mic className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Generate a 2-3 minute podcast discussion about this lecture
              </p>
              <p className="text-xs text-muted-foreground">
                Two AI hosts will discuss the key concepts in an engaging conversation
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              size="lg"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Generate Audio Overview
            </Button>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>
        )}

        {/* Generating state */}
        {isGenerating && (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">{loadingMessage}</p>
              <p className="text-sm text-muted-foreground">
                This may take 30-60 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Generated state */}
        {episode && (
          <div className="space-y-6">
            {/* Episode info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{episode.script.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {episode.duration_seconds
                    ? formatDuration(episode.duration_seconds)
                    : "~2-3 min"}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs bg-blue-500/10 text-blue-500 rounded-full">
                  Alex
                </span>
                <span className="px-3 py-1 text-xs bg-purple-500/10 text-purple-500 rounded-full">
                  Jordan
                </span>
              </div>
            </div>

            {/* Audio player */}
            {episode.audio_base64 && (
              <AudioPlayer
                audioBase64={episode.audio_base64}
                durationSeconds={episode.duration_seconds}
              />
            )}

            {/* Transcript toggle */}
            <Button
              variant="ghost"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full justify-between"
            >
              <span>Show Transcript</span>
              {showTranscript ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {/* Transcript content */}
            {showTranscript && (
              <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-1 bg-muted/20">
                {/* Introduction */}
                {episode.script.introduction && (
                  <div className="italic text-muted-foreground pb-2 border-b mb-2">
                    {episode.script.introduction}
                  </div>
                )}

                {/* Dialogue */}
                {renderTranscript(episode.script.dialogue)}

                {/* Conclusion */}
                {episode.script.conclusion && (
                  <div className="italic text-muted-foreground pt-2 border-t mt-2">
                    {episode.script.conclusion}
                  </div>
                )}
              </div>
            )}

            {/* Regenerate button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                size="sm"
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
