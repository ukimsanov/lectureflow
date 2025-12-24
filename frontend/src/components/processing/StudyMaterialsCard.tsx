"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlashcardsCard } from "./FlashcardsCard";
import { QuizCard } from "./QuizCard";
import { API_BASE_URL } from "@/lib/utils";
import type { Concept, Flashcard, QuizQuestion } from "@/types";

interface StudyMaterialsCardProps {
  concepts: Concept[];
  transcript: string;
}

export function StudyMaterialsCard({ concepts, transcript }: StudyMaterialsCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (concepts.length === 0) {
      toast.error("No concepts available to generate study materials");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/study-materials/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepts,
          transcript,
          max_flashcards: 15,
          max_quiz_questions: 10,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate study materials");
      }

      setFlashcards(data.data.flashcards);
      setQuizQuestions(data.data.quiz_questions);
      setHasGenerated(true);

      toast.success(
        `Generated ${data.data.flashcards.length} flashcards and ${data.data.quiz_questions.length} quiz questions!`
      );
    } catch (error) {
      console.error("Failed to generate study materials:", error);
      toast.error("Failed to generate study materials. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Show generate button if not generated yet
  if (!hasGenerated) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            Study Materials
            <span className="text-3xl">📚</span>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Generate flashcards and quiz questions to test your understanding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center max-w-md">
              <p className="text-muted-foreground">
                Based on {concepts.length} concepts extracted from this lecture, we can generate
                personalized flashcards and quiz questions to help you study.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || concepts.length === 0}
              className="px-8 py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  Generate Study Materials
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show generated materials
  return (
    <div className="space-y-6">
      <FlashcardsCard flashcards={flashcards} />
      <QuizCard questions={quizQuestions} />
    </div>
  );
}
