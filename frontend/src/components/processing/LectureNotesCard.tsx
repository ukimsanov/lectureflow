"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, FileJson, FileDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LectureNotesCardProps {
  notes: string;
  onExportMarkdown: () => void;
  onExportJSON: () => void;
  onExportPDF: () => void;
}

export function LectureNotesCard({
  notes,
  onExportMarkdown,
  onExportJSON,
  onExportPDF,
}: LectureNotesCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
              Lecture Notes
              <span className="text-3xl">📝</span>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              AI-generated summary and key points from the lecture
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md border border-primary/20 hover:border-primary/30 transition-all duration-200 font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onExportMarkdown}>
                <FileText className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportJSON}>
                <FileJson className="h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPDF}>
                <FileDown className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none
          [font-size:16px] [line-height:1.6]

          prose-headings:tracking-tight prose-headings:font-semibold prose-headings:scroll-mt-20 prose-headings:flex prose-headings:items-center prose-headings:gap-2
          prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-6 prose-h1:first:mt-0
          prose-h2:text-xl prose-h2:mb-2.5 prose-h2:mt-5 prose-h2:inline-flex prose-h2:w-full
          prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-h3:inline-flex

          prose-p:text-foreground prose-p:mb-3 prose-p:leading-[1.6] prose-p:last:mb-0
          prose-strong:text-foreground prose-strong:font-semibold
          prose-em:text-foreground prose-em:italic

          prose-ul:my-2.5 prose-ul:ml-0 prose-ul:list-disc prose-ul:pl-6
          prose-ol:my-2.5 prose-ol:ml-0 prose-ol:list-decimal prose-ol:pl-6
          prose-li:text-foreground prose-li:my-0.5 prose-li:leading-[1.6] prose-li:marker:text-primary/70

          prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-colors

          prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[14px] prose-code:before:content-none prose-code:after:content-none prose-code:font-normal
          prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-pre:p-4 prose-pre:rounded-lg prose-pre:text-sm prose-pre:my-3 prose-pre:overflow-x-auto
          prose-pre:code:bg-transparent prose-pre:code:p-0

          prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:my-3 prose-blockquote:text-muted-foreground

          prose-hr:border-border prose-hr:my-6 prose-hr:border-t

          prose-table:my-3 prose-table:border-collapse prose-table:w-full
          prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left prose-th:font-semibold
          prose-td:border prose-td:border-border prose-td:p-2

          prose-img:rounded-lg prose-img:my-3 prose-img:shadow-md
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {notes}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
