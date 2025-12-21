// Video and Processing Types

export interface VideoMetadata {
  video_title: string;
  channel_name: string;
  duration: number;
  transcript?: string;
}

export interface AITool {
  tool_name: string;
  category?: string;
  confidence_score?: number;
  context_snippet?: string;
  usage_context?: string;
  timestamp?: number;
}

export type StepStatus = "pending" | "in_progress" | "completed";

export interface ProcessingStep {
  id: string;
  label: string;
  status: StepStatus;
}

export interface CacheInfo {
  from_cache: boolean;
  cached_at?: string;
  cache_age_hours?: number;
}
