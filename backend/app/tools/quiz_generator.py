"""
GPT-4o-mini Quiz Generator
Generates multiple choice quiz questions from lecture concepts using GPT-4o-mini

Black box interface:
- Input: List of Concepts + transcript context
- Output: List of QuizQuestions

Generates multiple choice questions with:
- 4 plausible options per question
- Distractors based on related concepts
- Mix of difficulty levels
- Explanations for correct answers
"""
import os
from typing import List
from openai import OpenAI
from pydantic import BaseModel, Field

from app.models import Concept, QuizQuestion


class QuizGenerationResult(BaseModel):
    """Pydantic model for structured output from GPT-4o-mini"""
    quiz_questions: List[QuizQuestion] = Field(
        default_factory=list,
        description="List of generated quiz questions"
    )


class QuizGenerator:
    """
    Generates multiple choice quiz questions from extracted concepts using GPT-4o-mini.
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
        max_questions: int = 10
    ) -> List[QuizQuestion]:
        """
        Generate quiz questions from extracted concepts.

        Args:
            concepts: List of Concept objects extracted from lecture
            transcript: Optional transcript for additional context
            max_questions: Maximum number of questions to generate

        Returns:
            List of QuizQuestion objects
        """
        if not concepts:
            return []

        prompt = self._build_prompt(concepts, transcript, max_questions)

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
            response_format=QuizGenerationResult,
            temperature=0.7  # Slight creativity for varied questions
        )

        result = response.choices[0].message.parsed
        return result.quiz_questions if result else []

    def _get_system_prompt(self) -> str:
        """System prompt for quiz generation."""
        return """You are an expert educational assessment creator specializing in multiple choice questions.

Your quiz questions should:
1. Test genuine understanding, not trivial details
2. Have exactly 4 options (A, B, C, D)
3. Include plausible distractors that test common misconceptions
4. Have clear, unambiguous correct answers
5. Include helpful explanations that reinforce learning

Question types by category:
- Definitions: "Which of the following best describes [term]?"
- People: "What is [person] known for?"
- Formulas: "Which formula correctly represents [concept]?"
- Events: "What was a key outcome of [event]?"
- Theories: "According to [theory], which statement is true?"
- Comparisons: "What distinguishes [X] from [Y]?"

Distractor strategies:
- Use related but incorrect concepts
- Include common misconceptions
- Use partially correct answers
- Ensure all options are grammatically consistent with the question
"""

    def _build_prompt(
        self,
        concepts: List[Concept],
        transcript: str,
        max_questions: int
    ) -> str:
        """Build the prompt for quiz generation."""

        # Format concepts for the prompt
        concepts_text = "\n".join([
            f"- **{c.name}** ({c.category}, {c.importance} importance): {c.definition or c.context_snippet}"
            for c in concepts
        ])

        # Get concept names for distractors
        concept_names = [c.name for c in concepts]

        prompt = f"""Generate up to {max_questions} multiple choice quiz questions based on these lecture concepts:

**Concepts extracted from lecture:**
{concepts_text}

**Available concepts for creating distractors:** {', '.join(concept_names)}

**Guidelines:**
1. Focus on high and medium importance concepts
2. Create questions that test understanding, not just recall
3. Ensure exactly 4 options per question
4. Use other concepts from the list as plausible distractors when relevant
5. Mix difficulty levels:
   - easy: Direct recall of definitions
   - medium: Application or comparison
   - hard: Synthesis or analysis
6. Provide clear explanations that help students learn

**For each question provide:**
- question: Clear, well-formed question
- options: Exactly 4 options (list of strings)
- correct_index: Index 0-3 of the correct answer
- explanation: Why the correct answer is right (and why others are wrong)
- concept_name: Name of the primary concept being tested
- difficulty: easy, medium, or hard

Generate questions that would effectively assess a student's understanding of this material."""

        return prompt
