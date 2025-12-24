"""
GPT-4o-mini Flashcard Generator
Generates study flashcards from lecture concepts using GPT-4o-mini

Black box interface:
- Input: List of Concepts + transcript context
- Output: List of Flashcards

Generates question/answer pairs based on concept categories:
- Definitions → "What is X?"
- Formulas → "What formula calculates X?"
- People → "Who is X and what did they contribute?"
- Events → "What happened during X?"
"""
import os
from typing import List
from openai import OpenAI
from pydantic import BaseModel, Field

from app.models import Concept, Flashcard


class FlashcardGenerationResult(BaseModel):
    """Pydantic model for structured output from GPT-4o-mini"""
    flashcards: List[Flashcard] = Field(
        default_factory=list,
        description="List of generated flashcards"
    )


class FlashcardGenerator:
    """
    Generates study flashcards from extracted concepts using GPT-4o-mini.
    Uses structured outputs for reliable JSON parsing.
    """

    def __init__(self):
        """Initialize with GPT-4o-mini client."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY must be set in environment")

        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"

    def generate(
        self,
        concepts: List[Concept],
        transcript: str = "",
        max_flashcards: int = 15
    ) -> List[Flashcard]:
        """
        Generate flashcards from extracted concepts.

        Args:
            concepts: List of Concept objects extracted from lecture
            transcript: Optional transcript for additional context
            max_flashcards: Maximum number of flashcards to generate

        Returns:
            List of Flashcard objects
        """
        if not concepts:
            return []

        prompt = self._build_prompt(concepts, transcript, max_flashcards)

        response = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": self._get_system_prompt()
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format=FlashcardGenerationResult,
            temperature=0.7  # Slight creativity for varied questions
        )

        result = response.choices[0].message.parsed
        return result.flashcards if result else []

    def _get_system_prompt(self) -> str:
        """System prompt for flashcard generation."""
        return """You are an expert educational content creator specializing in creating effective study flashcards.

Your flashcards should:
1. Be clear and concise
2. Test understanding, not just memorization
3. Use active recall principles
4. Match difficulty to concept importance
5. Cover the key learning objectives

For different concept categories, use appropriate question formats:
- Terms/Definitions: "What is [term]?" or "Define [term]"
- People: "Who was [person] and what were their contributions?"
- Formulas: "What is the formula for [concept]?" or "How do you calculate [concept]?"
- Events: "What happened during [event]?" or "What were the causes/effects of [event]?"
- Theories: "Explain [theory]" or "What does [theory] state?"
- Tools/Frameworks: "What is [tool] used for?" or "How does [framework] work?"
"""

    def _build_prompt(
        self,
        concepts: List[Concept],
        transcript: str,
        max_flashcards: int
    ) -> str:
        """Build the prompt for flashcard generation."""

        # Format concepts for the prompt
        concepts_text = "\n".join([
            f"- **{c.name}** ({c.category}, {c.importance} importance): {c.definition or c.context_snippet}"
            for c in concepts
        ])

        # Prioritize high importance concepts
        high_importance = [c for c in concepts if c.importance == "high"]
        medium_importance = [c for c in concepts if c.importance == "medium"]

        prompt = f"""Generate up to {max_flashcards} study flashcards based on these lecture concepts:

**Concepts extracted from lecture:**
{concepts_text}

**Guidelines:**
1. Prioritize high importance concepts ({len(high_importance)} available)
2. Include medium importance concepts if space allows ({len(medium_importance)} available)
3. Create 1-2 flashcards per important concept
4. Match difficulty to concept importance:
   - high importance → medium/hard difficulty
   - medium importance → easy/medium difficulty
   - low importance → easy difficulty
5. Use varied question formats appropriate to each category
6. Keep answers concise but complete (1-3 sentences)

**For each flashcard provide:**
- question: Clear, specific question
- answer: Concise, accurate answer
- concept_name: Name of the related concept (must match one from the list)
- difficulty: easy, medium, or hard
- category: Same category as the concept

Generate flashcards that would help a student effectively study this material."""

        return prompt
