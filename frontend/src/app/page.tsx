"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { marked } from "marked";
import confetti from "canvas-confetti";
import { History, FileText, Sparkles, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ProgressTracker } from "@/components/ui/progress-tracker";
import { BorderBeam } from "@/components/ui/border-beam";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { PresetVideos } from "@/components/preset-videos";
import {
  VideoMetadataCard,
  LectureNotesCard,
  AIToolsGrid,
  ToolDetailModal,
  TranscriptModal,
} from "@/components/processing";
import { formatDuration, API_BASE_URL } from "@/lib/utils";
import type { VideoMetadata, AITool, ProcessingStep, CacheInfo } from "@/types";

// Loading indicator component
function LoadingIndicator() {
  return <span>Processing</span>;
}

export default function Home() {
  // Form state
  const [videoUrl, setVideoUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Streaming data state
  const [streamedNotes, setStreamedNotes] = useState<string>("");
  const [streamedMetadata, setStreamedMetadata] = useState<VideoMetadata | null>(null);
  const [streamedTools, setStreamedTools] = useState<AITool[]>([]);
  const [streamedTranscript, setStreamedTranscript] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

  // Modal state
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  // Processing steps tracker
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "fetch", label: "Fetch transcript", status: "pending" },
    { id: "generate", label: "Generate lecture notes", status: "pending" },
    { id: "extract", label: "Extract AI tools", status: "pending" },
  ]);

  const handleSubmit = async (e: React.FormEvent, forceReprocess = false) => {
    e.preventDefault();
    setIsStreaming(true);
    setError(null);
    setStreamedNotes("");
    setStreamedMetadata(null);
    setStreamedTools([]);
    setCacheInfo(null);

    // Reset steps and immediately start fetching
    setSteps([
      { id: "fetch", label: "Fetch transcript", status: "in_progress" },
      { id: "generate", label: "Generate lecture notes", status: "pending" },
      { id: "extract", label: "Extract AI tools", status: "pending" },
    ]);

    try {
      const url = `${API_BASE_URL}/api/process/stream?video_url=${encodeURIComponent(videoUrl)}${forceReprocess ? '&force=true' : ''}`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "status":
              break;

            case "cache":
              setCacheInfo(data.data);
              if (data.data.from_cache) {
                toast.success(`Using cached result from ${new Date(data.data.cached_at).toLocaleString()}`, {
                  description: `Processed ${data.data.cache_age_hours} hours ago`
                });
              }
              break;

            case "metadata":
              setStreamedMetadata(data.data);
              if (data.data.transcript) {
                setStreamedTranscript(data.data.transcript);
              }
              setSteps(prev => prev.map(s =>
                s.id === "fetch" ? { ...s, status: "completed" } :
                s.id === "generate" ? { ...s, status: "in_progress" } :
                s.id === "extract" ? { ...s, status: "in_progress" } : s
              ));
              break;

            case "chunk":
              setStreamedNotes((prev) => prev + data.data);
              break;

            case "notes_complete":
              setSteps(prev => prev.map(s =>
                s.id === "generate" ? { ...s, status: "completed" } : s
              ));
              break;

            case "tools":
              setStreamedTools(data.data);
              setSteps(prev => prev.map(s =>
                s.id === "extract" ? { ...s, status: "completed" } : s
              ));
              break;

            case "complete":
              setIsStreaming(false);
              setSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
              eventSource.close();
              // Celebrate with confetti!
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
              break;

            case "error":
              setError(data.error || "An error occurred");
              setIsStreaming(false);
              eventSource.close();
              break;
          }
        } catch (err) {
          console.error("Failed to parse SSE event:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error:", err);
        setError("Connection lost. Please try again.");
        setIsStreaming(false);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.error("Streaming error:", err);
      setError("Failed to connect to the backend. Make sure it's running on port 8000.");
      setIsStreaming(false);
    }
  };

  // Export handlers
  const handleExportMarkdown = () => {
    if (!streamedNotes || !streamedMetadata) return;

    const markdown = `# ${streamedMetadata.video_title}\n\n**Channel:** ${streamedMetadata.channel_name}\n**Duration:** ${formatDuration(streamedMetadata.duration)}\n\n---\n\n${streamedNotes}`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${streamedMetadata.video_title.replace(/[^a-z0-9]/gi, '_')}_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Markdown exported successfully');
  };

  const handleExportJSON = () => {
    if (!streamedNotes || !streamedMetadata) return;

    const data = {
      video_metadata: streamedMetadata,
      lecture_notes: streamedNotes,
      ai_tools: streamedTools,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${streamedMetadata.video_title.replace(/[^a-z0-9]/gi, '_')}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('JSON exported successfully');
  };

  const handleExportPDF = async () => {
    if (!streamedNotes || !streamedMetadata) return;

    try {
      toast.info('Generating PDF... This may take a moment');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Geist+Sans:wght@400;500;600;700&display=swap');
              body { font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.7; color: #1a1a1a; padding: 2rem; max-width: 800px; }
              h1 { font-size: 2rem; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.2; color: #111827; }
              h2 { font-size: 1.5rem; font-weight: 700; margin: 1.75rem 0 1rem; line-height: 1.3; color: #1f2937; }
              h3 { font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.75rem; line-height: 1.4; color: #374151; }
              p { margin-bottom: 1rem; line-height: 1.7; }
              strong { font-weight: 700; }
              em { font-style: italic; }
              ul, ol { margin: 1rem 0; padding-left: 2rem; line-height: 1.8; }
              ul { list-style-type: disc; }
              ol { list-style-type: decimal; }
              li { margin: 0.5rem 0; padding-left: 0.5rem; }
              code { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; }
              pre { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.75rem 0; }
              pre code { background: transparent; padding: 0; }
              blockquote { border-left: 4px solid #8b5cf6; background: #f5f3ff; padding: 0.75rem 1rem; margin: 0.75rem 0; }
              hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
              .metadata { color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <h1>${streamedMetadata.video_title}</h1>
            <div class="metadata">
              <strong>Channel:</strong> ${streamedMetadata.channel_name} |
              <strong>Duration:</strong> ${formatDuration(streamedMetadata.duration)}
            </div>
            <hr />
            ${marked.parse(streamedNotes)}
          </body>
        </html>
      `;

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          title: streamedMetadata.video_title.replace(/[^a-z0-9]/gi, '_'),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${streamedMetadata.video_title.replace(/[^a-z0-9]/gi, '_')}_notes.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF exported successfully');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF. Please try again.');
    }
  };

  const handleToolClick = (tool: AITool) => {
    setSelectedTool(tool);
    setToolModalOpen(true);
  };

  const handlePresetSelect = (url: string) => {
    setVideoUrl(url);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Beams */}
      <div className="fixed inset-0 z-0">
        <BackgroundBeams className="opacity-65 dark:opacity-60" />
      </div>

      {/* Top Right Actions */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <Link
          href="/history"
          className="flex items-center justify-center h-11 w-11 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card hover:border-border transition-all duration-200 shadow-lg hover:shadow-xl group"
          title="View Processing History"
        >
          <History className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
        </Link>
        <div className="flex items-center justify-center h-11 w-11">
          <AnimatedThemeToggler className="p-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card hover:border-border transition-all duration-200 shadow-lg hover:shadow-xl" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-8 pt-20 pb-4">
            {/* Orbiting Circles - 3 Agent Workflow Visualization */}
            <div className="relative flex h-[320px] w-full items-center justify-center">
              <AnimatedGradientText className="text-5xl md:text-7xl font-bold tracking-tight z-10">
                AI Lecture Notes
              </AnimatedGradientText>
              <OrbitingCircles
                radius={120}
                duration={20}
                path={false}
                iconSize={40}
              >
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 p-2 shadow-lg">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-2 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-2 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </OrbitingCircles>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Transform YouTube lectures into comprehensive notes with AI-powered multi-agent analysis
            </p>
          </div>

          {/* Input Form */}
          <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Enter YouTube URL</CardTitle>
              <CardDescription className="text-base">
                Paste a YouTube video URL to generate lecture notes and extract AI tools mentioned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isStreaming}
                  required
                  className="flex-1 h-12 text-base bg-background/50"
                />
                <ShimmerButton
                  type="submit"
                  disabled={isStreaming || !videoUrl}
                  className="h-12 px-8 text-base font-semibold sm:min-w-[180px] hover:shadow-2xl hover:brightness-110 transition-all duration-300"
                  shimmerColor="#ffffff"
                  shimmerSize="0.1em"
                  shimmerDuration="2s"
                  background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  borderRadius="0.75rem"
                >
                  {isStreaming ? <LoadingIndicator /> : "Generate Notes"}
                </ShimmerButton>
              </form>
            </CardContent>
          </Card>

          {/* Preset Videos Section */}
          {!isStreaming && !streamedMetadata && (
            <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Or Try a Sample Video</CardTitle>
                <CardDescription className="text-base">
                  Click any video below to see LectureFlow in action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PresetVideos onSelect={handlePresetSelect} />
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  Error
                  <span className="text-2xl">⚠️</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Progress Tracker */}
          {isStreaming && (
            <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl relative overflow-hidden">
              <BorderBeam
                size={120}
                duration={6}
                colorFrom="#667eea"
                colorTo="#764ba2"
              />
              <CardContent className="pt-6">
                <ProgressTracker steps={steps} />
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {streamedMetadata && (
            <div className="space-y-6 pb-16">
              <VideoMetadataCard
                metadata={streamedMetadata}
                transcript={streamedTranscript}
                cacheInfo={cacheInfo}
                isStreaming={isStreaming}
                onViewTranscript={() => setTranscriptModalOpen(true)}
                onForceReprocess={(e) => handleSubmit(e, true)}
              />

              <LectureNotesCard
                notes={streamedNotes}
                onExportMarkdown={handleExportMarkdown}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
              />

              <AIToolsGrid
                tools={streamedTools}
                isStreaming={isStreaming}
                onToolClick={handleToolClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ToolDetailModal
        tool={selectedTool}
        open={toolModalOpen}
        onOpenChange={setToolModalOpen}
      />

      <TranscriptModal
        transcript={streamedTranscript}
        open={transcriptModalOpen}
        onOpenChange={setTranscriptModalOpen}
      />
    </div>
  );
}
