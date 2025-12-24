"use client";

import { useState } from "react";
import { AIToolsGrid, ToolDetailModal } from "@/components/processing";
import type { Concept, AITool } from "@/types";

interface HistoryConceptsGridProps {
  concepts: Concept[];
  aiTools: AITool[];
}

export function HistoryConceptsGrid({ concepts, aiTools }: HistoryConceptsGridProps) {
  const [selectedTool, setSelectedTool] = useState<AITool | Concept | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleToolClick = (tool: AITool | Concept) => {
    setSelectedTool(tool);
    setModalOpen(true);
  };

  return (
    <>
      <AIToolsGrid
        tools={aiTools}
        concepts={concepts}
        isStreaming={false}
        onToolClick={handleToolClick}
      />
      <ToolDetailModal
        tool={selectedTool}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
