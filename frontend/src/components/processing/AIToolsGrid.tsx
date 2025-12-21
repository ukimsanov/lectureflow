"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AITool } from "@/types";

interface AIToolsGridProps {
  tools: AITool[];
  isStreaming: boolean;
  onToolClick: (tool: AITool) => void;
}

export function AIToolsGrid({ tools, isStreaming, onToolClick }: AIToolsGridProps) {
  // No tools found state
  if (tools.length === 0 && !isStreaming) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            AI Tools Detected
            <span className="text-3xl">🤖</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No AI tools were detected in this video.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Tools found
  if (tools.length > 0) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            AI Tools Detected
            <span className="text-3xl">🤖</span>
            <span className="text-lg font-normal text-muted-foreground">
              ({tools.length})
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            AI tools and technologies discussed in the lecture. Click to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {tools.map((tool: AITool, index: number) => (
              <button
                key={index}
                onClick={() => onToolClick(tool)}
                className="group relative p-6 border border-border/50 rounded-xl overflow-hidden text-left w-full cursor-pointer
                  bg-card/50 hover:bg-card
                  transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/30
                  before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/0 before:to-blue-500/0
                  hover:before:from-purple-500/10 hover:before:to-blue-500/10
                  before:transition-all before:duration-300 before:rounded-xl"
              >
                <div className="relative z-10 space-y-3">
                  <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                    {tool.tool_name || "Unknown Tool"}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {tool.context_snippet || tool.usage_context || "No context available"}
                  </div>
                  {tool.category && (
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-medium">
                        {tool.category}
                      </span>
                      {tool.confidence_score && (
                        <span className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-full">
                          {Math.round(tool.confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
