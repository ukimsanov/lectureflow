"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/modal";

interface TranscriptModalProps {
  transcript: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TranscriptModal({ transcript, open, onOpenChange }: TranscriptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy transcript:', err);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <ModalHeader className="border-b border-border/50 pb-4 pr-12">
          <div className="flex items-center justify-between gap-4">
            <ModalTitle className="text-2xl font-semibold tracking-tight">
              Video Transcript
            </ModalTitle>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-sm rounded-md border transition-all duration-200 font-medium ${
                copied
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                  : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 hover:border-primary/30'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
              {transcript}
            </pre>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
