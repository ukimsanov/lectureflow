"use client";

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/modal";
import type { AITool, Concept } from "@/types";

// Category icons for different concept types
const CATEGORY_ICONS: Record<string, string> = {
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
  model: "🤖",
  library: "📦",
  platform: "☁️",
  service: "⚡",
};

// Importance level styles
const IMPORTANCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-amber-500/20", text: "text-amber-500", label: "Key Concept" },
  medium: { bg: "bg-blue-500/20", text: "text-blue-500", label: "Important" },
  low: { bg: "bg-muted", text: "text-muted-foreground", label: "Mentioned" },
};

interface ToolDetailModalProps {
  tool: AITool | Concept | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolDetailModal({ tool, open, onOpenChange }: ToolDetailModalProps) {
  // Determine if it's a Concept or legacy AITool
  const isConcept = tool && 'name' in tool;
  const name = isConcept ? (tool as Concept).name : (tool as AITool)?.tool_name;
  const category = tool?.category;
  const confidence = tool?.confidence_score;
  const snippet = tool?.context_snippet;
  const definition = isConcept ? (tool as Concept).definition : null;
  const importance = isConcept ? (tool as Concept).importance : null;
  const usageContext = !isConcept ? (tool as AITool)?.usage_context : null;
  const timestamp = tool?.timestamp;

  const importanceStyle = importance ? IMPORTANCE_STYLES[importance] : null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <ModalHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <ModalTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              {category && CATEGORY_ICONS[category] && (
                <span>{CATEGORY_ICONS[category]}</span>
              )}
              {name || "Details"}
            </ModalTitle>
            {category && (
              <span className="text-sm px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-medium">
                {category}
              </span>
            )}
            {importanceStyle && (
              <span className={`text-sm px-4 py-1.5 ${importanceStyle.bg} ${importanceStyle.text} rounded-full border border-current/20 font-medium`}>
                {importanceStyle.label}
              </span>
            )}
          </div>
          <ModalDescription className="text-base mt-1.5">
            {isConcept ? "Concept extracted from the lecture" : "Tool information extracted from the lecture"}
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-6 py-6">
          {tool && (
            <>
              {/* Definition (for Concepts) */}
              {definition && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Definition
                  </h3>
                  <p className="text-[15px] leading-[1.6] text-foreground/90 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    {definition}
                  </p>
                </div>
              )}

              {/* Confidence Score */}
              {confidence !== undefined && confidence !== null && (
                <div className="space-y-2 pb-4 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Confidence Score</span>
                    <span className="text-sm font-semibold text-primary">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Context Quote */}
              {snippet && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Context from Lecture
                  </h3>
                  <blockquote className="relative pl-5 py-4 pr-4 bg-muted/40 rounded-lg border-l-[3px] border-primary">
                    <p className="text-[15px] leading-[1.6] text-foreground/90 italic">
                      &ldquo;{snippet}&rdquo;
                    </p>
                  </blockquote>
                </div>
              )}

              {/* Usage Context (for legacy AITool) */}
              {usageContext && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    How It&apos;s Used
                  </h3>
                  <p className="text-[15px] leading-[1.6] text-muted-foreground">
                    {usageContext}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              {timestamp !== null && timestamp !== undefined && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-t border-border/30 mt-4">
                  <span className="text-sm font-medium text-foreground">Mentioned At</span>
                  <span className="text-sm font-mono font-semibold text-primary">
                    {Math.floor(timestamp / 60)}:{String(Math.floor(timestamp % 60)).padStart(2, '0')}
                  </span>
                </div>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
