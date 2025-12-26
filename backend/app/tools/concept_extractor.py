"""
GPT-4o-mini Concept Extractor
Extracts key concepts from ANY educational content type using GPT-4o-mini

Black box interface:
- Input: Transcript text (string), optional content type hint
- Output: List of Concepts (List[Concept])

Supported content types:
- science: Formulas, theories, scientists, experiments
- history: Dates, events, figures, causes/effects
- business: Frameworks, case studies, metrics
- tech: Tools, libraries, architectures
- math: Formulas, proofs, theorems
- general: Key terms, definitions, quotes
"""
import os
from typing import List
from openai import OpenAI
from pydantic import BaseModel, Field

from app.models import Concept, ContentType


class ConceptExtractionResult(BaseModel):
    """Pydantic model for structured output from GPT-4o-mini"""
    content_type: ContentType = Field(
        ...,
        description="Detected content type of the lecture"
    )
    concepts: List[Concept] = Field(
        default_factory=list,
        description="List of key concepts, terms, people, and entities extracted"
    )


# Content type detection keywords
CONTENT_TYPE_KEYWORDS = {
    "science": [
        "hypothesis", "experiment", "molecule", "cell", "atom", "physics",
        "chemistry", "biology", "evolution", "DNA", "quantum", "electron",
        "gravity", "mass", "energy", "reaction", "compound", "organism"
    ],
    "history": [
        "century", "war", "revolution", "empire", "dynasty", "era", "civilization",
        "treaty", "battle", "king", "queen", "president", "ancient", "medieval",
        "colonial", "independence", "movement", "reform"
    ],
    "business": [
        "revenue", "profit", "market", "startup", "CEO", "strategy", "investment",
        "stock", "valuation", "growth", "customer", "product", "sales", "marketing",
        "management", "leadership", "disruption", "innovation"
    ],
    "tech": [
        "API", "framework", "library", "algorithm", "code", "database", "server",
        "frontend", "backend", "cloud", "deployment", "software", "hardware",
        "programming", "machine learning", "artificial intelligence", "neural network"
    ],
    "math": [
        "theorem", "proof", "equation", "calculus", "algebra", "geometry",
        "derivative", "integral", "function", "variable", "matrix", "vector",
        "probability", "statistics", "limit", "infinity"
    ]
}


class ConceptExtractor:
    """
    Extracts key concepts from lecture transcripts using GPT-4o-mini.
    Works with ANY educational content type - not just AI/tech.

    Black box interface - implementation details hidden.
    Uses structured outputs for reliable JSON parsing.
    """

    def __init__(self):
        """
        Initialize the extractor with GPT-4o-mini.
        API key loaded from OPENAI_API_KEY environment variable.
        """
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise ValueError("OPENAI_API_KEY must be set in environment")

        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"

    def extract(
        self,
        transcript: str,
        video_title: str = None,
        content_type_hint: str = None
    ) -> tuple[List[Concept], ContentType]:
        """
        Main interface: Extract key concepts from transcript.

        Args:
            transcript: Full transcript text
            video_title: Optional video title for context
            content_type_hint: Optional hint for content type (science, history, etc.)

        Returns:
            Tuple of (List of Concept objects, ContentType)

        Raises:
            Exception: If extraction fails
        """
        # Detect content type if not provided
        detected_type = content_type_hint or self._detect_content_type(transcript)

        # Build the prompt based on content type
        prompt = self._build_prompt(transcript, video_title, detected_type)

        # Extract using GPT-4o-mini with structured outputs
        response = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": self._get_system_prompt(detected_type)
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format=ConceptExtractionResult,
            temperature=0  # Deterministic extraction
        )

        # Extract the parsed response
        result = response.choices[0].message.parsed

        if result:
            return result.concepts, result.content_type
        return [], ContentType(primary_type="general", confidence=0.5, keywords_matched=[])

    # =========================================================================
    # PRIVATE METHODS - Implementation details hidden from interface
    # =========================================================================

    def _detect_content_type(self, transcript: str) -> str:
        """
        Auto-detect content type based on keyword frequency.
        Returns the most likely content type.
        """
        transcript_lower = transcript.lower()
        scores = {}

        for content_type, keywords in CONTENT_TYPE_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw.lower() in transcript_lower)
            scores[content_type] = score

        # Get the type with highest score
        if scores:
            best_type = max(scores, key=scores.get)
            if scores[best_type] >= 3:  # Need at least 3 keyword matches
                return best_type

        return "general"

    def _get_system_prompt(self, content_type: str) -> str:
        """
        Get the appropriate system prompt based on content type.
        """
        type_instructions = {
            "science": "You are an expert at extracting scientific concepts, theories, formulas, experiments, and notable scientists from educational content.",
            "history": "You are an expert at extracting historical events, dates, figures, movements, and cause-effect relationships from educational content.",
            "business": "You are an expert at extracting business concepts, frameworks, case studies, metrics, and notable entrepreneurs from educational content.",
            "tech": "You are an expert at extracting technical concepts, tools, frameworks, architectures, and implementation patterns from educational content.",
            "math": "You are an expert at extracting mathematical concepts, theorems, proofs, formulas, and problem-solving techniques from educational content.",
            "general": "You are an expert at extracting key concepts, terms, definitions, and important references from educational content."
        }

        return type_instructions.get(content_type, type_instructions["general"])

    def _build_prompt(self, transcript: str, video_title: str = None, content_type: str = "general") -> str:
        """
        Build optimized prompt for GPT-4o-mini concept extraction.
        Adapts based on detected content type.
        """
        title_context = f"Video Title: {video_title}\n\n" if video_title else ""

        # Content-type specific extraction instructions
        extraction_guides = {
            "science": """
**What to extract**:
- Scientific theories and laws (e.g., Theory of Relativity, Newton's Laws)
- Formulas and equations (e.g., E=mc², F=ma)
- Scientists and researchers (e.g., Einstein, Darwin, Curie)
- Experiments and discoveries (e.g., Double-slit experiment)
- Technical terms with definitions
- Processes and mechanisms (e.g., photosynthesis, mitosis)""",

            "history": """
**What to extract**:
- Historical events and their dates (e.g., World War II, 1939-1945)
- Historical figures (e.g., Napoleon, Lincoln, Gandhi)
- Civilizations and empires (e.g., Roman Empire, Ming Dynasty)
- Treaties, battles, and political movements
- Cause-and-effect relationships
- Key terms and concepts (e.g., Feudalism, Renaissance)""",

            "business": """
**What to extract**:
- Business frameworks (e.g., Porter's Five Forces, SWOT Analysis)
- Key metrics and KPIs (e.g., CAC, LTV, ARR)
- Companies and entrepreneurs mentioned
- Case studies and examples
- Strategies and tactics
- Industry terms and jargon""",

            "tech": """
**What to extract**:
- Frameworks and libraries (e.g., React, TensorFlow, Django)
- Programming concepts (e.g., recursion, async/await)
- Tools and platforms (e.g., Docker, AWS, Kubernetes)
- Architectures and patterns (e.g., microservices, REST)
- Models and algorithms (e.g., GPT-4, transformers)
- Best practices and conventions""",

            "math": """
**What to extract**:
- Theorems and proofs (e.g., Pythagorean theorem, Fundamental theorem of calculus)
- Formulas and equations with explanations
- Mathematical concepts (e.g., limits, derivatives, matrices)
- Mathematicians mentioned (e.g., Euler, Gauss, Ramanujan)
- Problem-solving techniques
- Definitions of key terms""",

            "general": """
**What to extract**:
- Key terms and their definitions
- Important concepts discussed
- Notable people or entities mentioned
- Books, papers, or resources referenced
- Quotes or memorable statements
- Core ideas and takeaways"""
        }

        extraction_guide = extraction_guides.get(content_type, extraction_guides["general"])

        prompt = f"""{title_context}**Detected Content Type**: {content_type}

**Task**: Extract ALL key concepts, terms, and entities from the following transcript.
{extraction_guide}

**For each concept, provide**:
1. **name**: The exact name of the concept, term, person, or entity
2. **category**: One of: term, definition, person, theory, formula, event, tool, framework, book, place, date
3. **definition**: Brief 1-2 sentence explanation (if applicable)
4. **context_snippet**: Brief quote where it was mentioned (max 100 chars)
5. **timestamp**: null (we'll map this separately)
6. **confidence_score**: 0.0-1.0 based on how clearly it was mentioned
7. **importance**: high (core concept), medium (supporting), or low (mentioned briefly)

**Also provide content_type detection**:
- primary_type: Your detected content type (science, history, business, tech, math, general)
- confidence: How confident you are in this detection (0.0-1.0)
- keywords_matched: List of keywords that led to this detection

**Important**:
- Only extract concepts that are CLEARLY discussed (not just mentioned in passing)
- Prioritize concepts that would be useful for studying/review
- Include definitions when the speaker explains something
- Use importance to distinguish core vs supplementary concepts
- Return empty list if no meaningful concepts are found

**Transcript**:
{transcript}

**Output**: JSON following the ConceptExtractionResult schema."""

        return prompt


# Backward compatibility alias
AIToolExtractor = ConceptExtractor
