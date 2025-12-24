"use client";

import { useState, useMemo } from "react";
import { Brain, RotateCcw, Check, X, ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

interface QuizCardProps {
  questions: QuizQuestion[];
}

type QuizState = "ready" | "in_progress" | "completed";

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function QuizCard({ questions }: QuizCardProps) {
  const [quizState, setQuizState] = useState<QuizState>("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const activeQuestions = useMemo(() => {
    return quizState === "ready" ? questions : shuffledQuestions;
  }, [quizState, questions, shuffledQuestions]);

  const currentQuestion = activeQuestions[currentIndex];
  const totalQuestions = activeQuestions.length;

  // Calculate score
  const score = useMemo(() => {
    return answers.reduce<number>((acc, answer, idx) => {
      if (answer !== null && answer === shuffledQuestions[idx]?.correct_index) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [answers, shuffledQuestions]);

  const handleStartQuiz = () => {
    // Shuffle questions for variety
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setQuizState("in_progress");
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
  };

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnswers((prev) => [...prev, index]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= totalQuestions) {
      setQuizState("completed");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetry = () => {
    setQuizState("ready");
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setShuffledQuestions([]);
  };

  if (questions.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            Quiz
            <span className="text-3xl">📝</span>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            No quiz questions generated yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Ready state - Start quiz
  if (quizState === "ready") {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            Quiz
            <span className="text-3xl">📝</span>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Test your knowledge with {totalQuestions} questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to test yourself?</h3>
              <p className="text-muted-foreground">
                {totalQuestions} multiple choice questions based on the lecture content
              </p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              Start Quiz
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed state - Show results
  if (quizState === "completed") {
    const percentage = Math.round((score / totalQuestions) * 100);
    const grade =
      percentage >= 90
        ? { label: "Excellent!", color: "text-green-500" }
        : percentage >= 70
          ? { label: "Good job!", color: "text-blue-500" }
          : percentage >= 50
            ? { label: "Keep practicing!", color: "text-yellow-500" }
            : { label: "Review the material", color: "text-red-500" };

    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            Quiz Results
            <span className="text-3xl">🎉</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className={cn("text-2xl font-bold mb-2", grade.color)}>
                {grade.label}
              </h3>
              <p className="text-4xl font-bold mb-2">
                {score} / {totalQuestions}
              </p>
              <p className="text-muted-foreground">
                You scored {percentage}% on this quiz
              </p>
            </div>

            {/* Answer Summary */}
            <div className="w-full max-w-md mt-4">
              <div className="grid grid-cols-5 gap-2">
                {answers.map((answer, idx) => {
                  const isCorrect = answer === shuffledQuestions[idx]?.correct_index;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "h-10 rounded-lg flex items-center justify-center text-sm font-medium",
                        isCorrect
                          ? "bg-green-500/20 text-green-600 border border-green-500/30"
                          : "bg-red-500/20 text-red-600 border border-red-500/30"
                      )}
                    >
                      {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // In progress - Show question
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
              Quiz
              <span className="text-3xl">📝</span>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Question {currentIndex + 1} of {totalQuestions}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("text-sm", difficultyColors[currentQuestion?.difficulty || "medium"])}
          >
            {currentQuestion?.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="py-4">
            <h3 className="text-lg md:text-xl font-medium leading-relaxed">
              {currentQuestion?.question}
            </h3>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correct_index;
              const showResult = showExplanation;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border transition-all duration-200",
                    !showResult && "hover:bg-muted/50 hover:border-primary/30",
                    !showResult && isSelected && "bg-primary/10 border-primary/50",
                    showResult && isCorrect && "bg-green-500/10 border-green-500/50",
                    showResult && isSelected && !isCorrect && "bg-red-500/10 border-red-500/50",
                    showResult && !isSelected && !isCorrect && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border",
                        !showResult && "bg-muted/50 border-border",
                        showResult && isCorrect && "bg-green-500 text-white border-green-500",
                        showResult && isSelected && !isCorrect && "bg-red-500 text-white border-red-500"
                      )}
                    >
                      {showResult && isCorrect ? (
                        <Check className="h-4 w-4" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <X className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-sm font-medium text-primary mb-1">Explanation</p>
              <p className="text-muted-foreground">{currentQuestion?.explanation}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Related concept: {currentQuestion?.concept_name}
              </p>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {currentIndex + 1 >= totalQuestions ? "See Results" : "Next Question"}
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
