"use client";

import { StudyMaterialsCard } from "@/components/processing";
import type { Concept } from "@/types";

interface HistoryStudyMaterialsProps {
  concepts: Concept[];
}

export function HistoryStudyMaterials({ concepts }: HistoryStudyMaterialsProps) {
  // StudyMaterialsCard needs concepts and transcript
  // Transcript is optional for the study materials API, so we pass empty string
  return <StudyMaterialsCard concepts={concepts} transcript="" />;
}
