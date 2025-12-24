"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AITool, Concept, ContentType } from "@/types";

// Category icons for different concept types
const CATEGORY_ICONS: Record<string, string> = {
  // Content type icons
  science: "🔬",
  history: "📜",
  business: "💼",
  tech: "💻",
  math: "📐",
  general: "📚",
  // Concept category icons
  term: "📖",
  definition: "📝",
  person: "👤",
  theory: "💡",
  formula: "🧮",
  event: "📅",
  tool: "🛠️",
  framework: "🏗️",
  book: "📕",
  place: "📍",
  date: "🗓️",
  // Legacy
  model: "🤖",
  library: "📦",
  platform: "☁️",
  service: "⚡",
};

// Content type display names
const CONTENT_TYPE_LABELS: Record<string, string> = {
  science: "Science & Research",
  history: "History & Events",
  business: "Business & Finance",
  tech: "Technology & AI",
  math: "Mathematics",
  general: "General Topics",
};

interface AIToolsGridProps {
  tools: AITool[];
  concepts?: Concept[];
  contentType?: ContentType;
  isStreaming: boolean;
  onToolClick: (tool: AITool | Concept) => void;
}

export function AIToolsGrid({
  tools,
  concepts = [],
  contentType,
  isStreaming,
  onToolClick
}: AIToolsGridProps) {
  // Prefer concepts over legacy tools if available
  const hasConceptsData = concepts.length > 0;
  const displayItems = hasConceptsData ? concepts : tools;
  const detectedType = contentType?.primary_type || "general";

  // Get the appropriate title based on content type
  const getTitle = () => {
    if (hasConceptsData && contentType) {
      return `Key Concepts`;
    }
    return "AI Tools Detected";
  };

  const getIcon = () => {
    if (hasConceptsData && contentType) {
      return CATEGORY_ICONS[detectedType] || "📚";
    }
    return "🤖";
  };

  const getDescription = () => {
    if (hasConceptsData && contentType) {
      const typeLabel = CONTENT_TYPE_LABELS[detectedType] || "General";
      return `${typeLabel} concepts extracted from the lecture. Click to view details.`;
    }
    return "AI tools and technologies discussed in the lecture. Click to view details.";
  };

  // No items found state
  if (displayItems.length === 0 && !isStreaming) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            Key Concepts
            <span className="text-3xl">📚</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No key concepts were detected in this video.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Items found
  if (displayItems.length > 0) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
              {getTitle()}
              <span className="text-3xl">{getIcon()}</span>
              <span className="text-lg font-normal text-muted-foreground">
                ({displayItems.length})
              </span>
            </CardTitle>
            {contentType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                  {CONTENT_TYPE_LABELS[detectedType]}
                </span>
                <span className="text-xs">
                  {Math.round(contentType.confidence * 100)}% confident
                </span>
              </div>
            )}
          </div>
          <CardDescription className="text-base">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {displayItems.map((item, index: number) => {
              // Handle both Concept and AITool types
              const isConcept = 'name' in item;
              const name = isConcept ? (item as Concept).name : (item as AITool).tool_name;
              const category = item.category || "general";
              const snippet = item.context_snippet ||
                ('usage_context' in item ? (item as AITool).usage_context : "") ||
                "No context available";
              const definition = isConcept ? (item as Concept).definition : null;
              const importance = isConcept ? (item as Concept).importance : null;
              const confidence = item.confidence_score;

              return (
                <button
                  key={index}
                  onClick={() => onToolClick(item)}
                  className="group relative p-6 border border-border/50 rounded-xl overflow-hidden text-left w-full cursor-pointer
                    bg-card/50 hover:bg-card
                    transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/30
                    before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/0 before:to-blue-500/0
                    hover:before:from-purple-500/10 hover:before:to-blue-500/10
                    before:transition-all before:duration-300 before:rounded-xl"
                >
                  <div className="relative z-10 space-y-3">
                    {/* Name with importance indicator */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                        {CATEGORY_ICONS[category] || "📌"} {name || "Unknown"}
                      </div>
                      {importance === "high" && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded-full border border-amber-500/30">
                          Key
                        </span>
                      )}
                    </div>

                    {/* Definition if available */}
                    {definition && (
                      <div className="text-sm text-foreground/80 leading-relaxed">
                        {definition}
                      </div>
                    )}

                    {/* Context snippet */}
                    <div className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
                      &ldquo;{snippet}&rdquo;
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-medium">
                        {category}
                      </span>
                      {confidence !== undefined && confidence !== null && (
                        <span className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-full">
                          {Math.round(confidence * 100)}% confidence
                        </span>
                      )}
                      {importance && importance !== "high" && (
                        <span className="text-xs px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-full">
                          {importance}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
