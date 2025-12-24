// Video and Processing Types

export interface VideoMetadata {
  video_title: string;
  channel_name: string;
  duration: number;
  transcript?: string;
}

// Legacy interface for backward compatibility
export interface AITool {
  tool_name: string;
  category?: string;
  confidence_score?: number;
  context_snippet?: string;
  usage_context?: string;
  timestamp?: number;
}

// New generalized Concept interface
export interface Concept {
  name: string;
  category: string;  // term, definition, person, theory, formula, event, tool, framework, book, place, date
  definition?: string;
  context_snippet: string;
  timestamp?: number;
  confidence_score: number;
  importance: "high" | "medium" | "low";
}

// Content type detection result
export interface ContentType {
  primary_type: "science" | "history" | "business" | "tech" | "math" | "general";
  confidence: number;
  keywords_matched: string[];
}

// Study Materials Types
export interface Flashcard {
  question: string;
  answer: string;
  concept_name: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];  // 4 options
  correct_index: number;  // 0-3
  explanation: string;
  concept_name: string;
  difficulty: "easy" | "medium" | "hard";
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
