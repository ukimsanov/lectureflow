"use client";

import { useState, useMemo } from "react";
import { Layers, Download, RotateCcw, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types";

interface FlashcardsCardProps {
  flashcards: Flashcard[];
}

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function FlashcardsCard({ flashcards }: FlashcardsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  // Filter flashcards based on difficulty
  const filteredCards = useMemo(() => {
    const cards = isShuffled ? shuffledCards : flashcards;
    if (!filterDifficulty) return cards;
    return cards.filter((card) => card.difficulty === filterDifficulty);
  }, [flashcards, shuffledCards, filterDifficulty, isShuffled]);

  const currentCard = filteredCards[currentIndex];
  const totalCards = filteredCards.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setIsShuffled(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setIsShuffled(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setFilterDifficulty(null);
  };

  const handleExportCSV = () => {
    const csv = [
      "Question,Answer,Concept,Difficulty,Category",
      ...flashcards.map(
        (card) =>
          `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}","${card.concept_name}","${card.difficulty}","${card.category}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAnki = () => {
    // Anki uses tab-separated format
    const anki = flashcards
      .map((card) => `${card.question}\t${card.answer}\t${card.concept_name}`)
      .join("\n");
    const blob = new Blob([anki], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards-anki.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (flashcards.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            Flashcards
            <span className="text-3xl">🃏</span>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            No flashcards generated yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50 shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
              Flashcards
              <span className="text-3xl">🃏</span>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {totalCards} flashcards to help you study
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm bg-muted/50 hover:bg-muted text-foreground rounded-md border border-border/50 hover:border-border transition-all duration-200 font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  {filterDifficulty || "All"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterDifficulty(null)}>
                  All Difficulties
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDifficulty("easy")}>
                  Easy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDifficulty("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDifficulty("hard")}>
                  Hard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md border border-primary/20 hover:border-primary/30 transition-all duration-200 font-medium flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAnki}>
                  Export for Anki
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Flashcard Display */}
        <div className="flex flex-col items-center gap-6">
          {/* Card Container */}
          <div
            className="relative w-full max-w-2xl aspect-[3/2] perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={cn(
                "absolute inset-0 transition-transform duration-500 preserve-3d",
                isFlipped && "rotate-y-180"
              )}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front - Question */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 flex flex-col justify-center items-center backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", difficultyColors[currentCard?.difficulty || "medium"])}
                  >
                    {currentCard?.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    {currentCard?.category}
                  </Badge>
                </div>
                <p className="text-lg md:text-xl text-center font-medium leading-relaxed">
                  {currentCard?.question}
                </p>
                <p className="absolute bottom-4 text-sm text-muted-foreground">
                  Click to reveal answer
                </p>
              </div>

              {/* Back - Answer */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-8 flex flex-col justify-center items-center"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="absolute top-4 left-4">
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                    Answer
                  </Badge>
                </div>
                <p className="text-lg md:text-xl text-center leading-relaxed">
                  {currentCard?.answer}
                </p>
                <p className="absolute bottom-4 text-xs text-muted-foreground">
                  Related to: {currentCard?.concept_name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-200"
              disabled={totalCards <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                Card {currentIndex + 1} of {totalCards}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-200"
              disabled={totalCards <= 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="h-6 w-px bg-border mx-2" />

            <button
              onClick={handleShuffle}
              className="p-3 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-200"
              title="Shuffle cards"
            >
              <Shuffle className="h-5 w-5" />
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-200"
              title="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="w-full max-w-2xl flex gap-1">
            {filteredCards.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-200",
                  idx === currentIndex
                    ? "bg-primary"
                    : idx < currentIndex
                      ? "bg-primary/40"
                      : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
