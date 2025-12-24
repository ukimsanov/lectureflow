"use client";

import { PodcastCard } from "@/components/processing";
import type { Concept } from "@/types";

interface HistoryPodcastCardProps {
  concepts: Concept[];
  lectureNotes: string;
  videoTitle: string;
}

export function HistoryPodcastCard({ concepts, lectureNotes, videoTitle }: HistoryPodcastCardProps) {
  return (
    <PodcastCard
      concepts={concepts}
      lectureNotes={lectureNotes}
      videoTitle={videoTitle}
    />
  );
}
