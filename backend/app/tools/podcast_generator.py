"""
GPT-4o-mini Podcast Script Generator
Generates engaging two-host podcast scripts from lecture concepts

Black box interface:
- Input: List of Concepts + Lecture Notes + Video Title
- Output: PodcastScript with dialogue between Alex (host) and Jordan (expert)

Script generation process (inspired by NotebookLM):
1. Identify key points to cover
2. Write natural back-and-forth dialogue
3. Add reactions and conversational elements ("disfluencies")
4. Include wrap-up with key takeaways
"""
import os
from typing import List
from openai import OpenAI
from pydantic import BaseModel, Field

from app.models import Concept, PodcastScript, PodcastDialogue


class PodcastScriptResult(BaseModel):
    """Pydantic model for structured output from GPT-4o-mini"""
    script: PodcastScript = Field(..., description="The generated podcast script")


class PodcastScriptGenerator:
    """
    Generates podcast scripts from lecture concepts using GPT-4o-mini.
    Creates engaging two-host dialogue with Alex (curious host) and Jordan (expert).
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
        lecture_notes: str,
        video_title: str = "Lecture",
        target_exchanges: int = 15
    ) -> PodcastScript:
        """
        Generate a podcast script from lecture concepts.

        Args:
            concepts: List of Concept objects extracted from lecture
            lecture_notes: Full lecture notes for context
            video_title: Title of the source video
            target_exchanges: Target number of dialogue exchanges (default 15 for ~2-3 min)

        Returns:
            PodcastScript with title, introduction, dialogue, and conclusion
        """
        if not concepts:
            # Return minimal script if no concepts
            return PodcastScript(
                title=f"Discussing: {video_title}",
                introduction="Today we're diving into an interesting topic.",
                dialogue=[
                    PodcastDialogue(speaker="Alex", text="So Jordan, what can you tell us about this?"),
                    PodcastDialogue(speaker="Jordan", text="Well, there are some fascinating points to cover here."),
                ],
                conclusion="Thanks for listening! See you next time."
            )

        prompt = self._build_prompt(concepts, lecture_notes, video_title, target_exchanges)

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
            response_format=PodcastScriptResult,
            temperature=0.8  # Higher creativity for natural dialogue
        )

        result = response.choices[0].message.parsed
        return result.script if result else PodcastScript(
            title=video_title,
            introduction="Welcome to our discussion.",
            dialogue=[],
            conclusion="Thanks for listening!"
        )

    def _get_system_prompt(self) -> str:
        """System prompt for podcast script generation."""
        return """You are a podcast script writer creating engaging educational content.

You write scripts for a podcast with two hosts:
- **Alex**: The curious, enthusiastic host who asks great questions and reacts naturally
- **Jordan**: The knowledgeable expert who explains concepts clearly and engagingly

Your scripts should:
1. Feel like a natural conversation, not a lecture
2. Include reactions ("Oh interesting!", "Wait, really?", "That makes sense!")
3. Break down complex topics into digestible explanations
4. Use analogies and examples to clarify concepts
5. Have Alex ask follow-up questions a listener might have
6. Keep a good pace - not too rushed, not too slow
7. End with key takeaways listeners can remember

The podcast should be engaging, educational, and feel like two friends discussing an interesting topic.
Each speaker turn should be 1-3 sentences - keep it conversational, not monologue-heavy."""

    def _build_prompt(
        self,
        concepts: List[Concept],
        lecture_notes: str,
        video_title: str,
        target_exchanges: int
    ) -> str:
        """Build the prompt for script generation."""

        # Format concepts for the prompt
        high_importance = [c for c in concepts if c.importance == "high"]
        medium_importance = [c for c in concepts if c.importance == "medium"]

        concepts_text = "\n".join([
            f"- **{c.name}** ({c.category}): {c.definition or c.context_snippet}"
            for c in (high_importance + medium_importance)[:10]  # Focus on top 10 concepts
        ])

        # Truncate notes if too long
        notes_preview = lecture_notes[:2000] + "..." if len(lecture_notes) > 2000 else lecture_notes

        prompt = f"""Create a podcast script discussing this lecture content.

**Video Title:** {video_title}

**Key Concepts to Cover:**
{concepts_text}

**Lecture Notes Preview:**
{notes_preview}

**Requirements:**
1. Create an engaging title for this podcast episode
2. Write a brief, catchy introduction (1-2 sentences to hook listeners)
3. Write {target_exchanges} dialogue exchanges between Alex and Jordan
4. Cover the most important concepts naturally in the conversation
5. Include natural reactions and follow-up questions
6. End with a conclusion summarizing 2-3 key takeaways

**Dialogue Guidelines:**
- Alex asks questions, reacts with curiosity, and sometimes shares observations
- Jordan explains concepts clearly, uses examples, and builds understanding
- Keep each turn to 1-3 sentences
- Include filler phrases occasionally ("You know what...", "So basically...", "Here's the thing...")
- Make transitions feel natural

Generate the podcast script now."""

        return prompt
