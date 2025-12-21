"use client";

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/modal";
import type { AITool } from "@/types";

interface ToolDetailModalProps {
  tool: AITool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolDetailModal({ tool, open, onOpenChange }: ToolDetailModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <ModalHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <ModalTitle className="text-2xl font-semibold tracking-tight">
              {tool?.tool_name || "Tool Details"}
            </ModalTitle>
            {tool?.category && (
              <span className="text-sm px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-medium">
                {tool.category}
              </span>
            )}
          </div>
          <ModalDescription className="text-base mt-1.5">
            Detailed information extracted from the lecture
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-6 py-6">
          {tool && (
            <>
              {/* Confidence Score */}
              {tool.confidence_score && (
                <div className="space-y-2 pb-4 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Confidence Score</span>
                    <span className="text-sm font-semibold text-primary">
                      {Math.round(tool.confidence_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${tool.confidence_score * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Context Quote */}
              {tool.context_snippet && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Context from Lecture
                  </h3>
                  <blockquote className="relative pl-5 py-4 pr-4 bg-muted/40 rounded-lg border-l-[3px] border-primary">
                    <p className="text-[15px] leading-[1.6] text-foreground/90 italic">
                      &ldquo;{tool.context_snippet}&rdquo;
                    </p>
                  </blockquote>
                </div>
              )}

              {/* Usage Context */}
              {tool.usage_context && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    How It&apos;s Used
                  </h3>
                  <p className="text-[15px] leading-[1.6] text-muted-foreground">
                    {tool.usage_context}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              {tool.timestamp !== null && tool.timestamp !== undefined && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-t border-border/30 mt-4">
                  <span className="text-sm font-medium text-foreground">Mentioned At</span>
                  <span className="text-sm font-mono font-semibold text-primary">
                    {Math.floor(tool.timestamp / 60)}:{String(Math.floor(tool.timestamp % 60)).padStart(2, '0')}
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
