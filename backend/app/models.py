"""
Pydantic models for LectureFlow API
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class TranscriptChunk(BaseModel):
    """Individual chunk of transcript with timestamp"""
    chunk_id: str
    text: str
    start_time: float = Field(..., description="Start time in seconds")


class VideoMetadata(BaseModel):
    """YouTube video metadata"""
    video_id: str
    video_title: str
    video_url: str
    channel_name: str
    duration: Optional[int] = None  # Duration in seconds


class TranscriptData(BaseModel):
    """Complete transcript data with metadata"""
    metadata: VideoMetadata
    transcript_chunks: List[TranscriptChunk]
    full_text: str = Field(..., description="Complete transcript as single text")


class ExtractRequest(BaseModel):
    """Request model for transcript extraction"""
    video_url: str = Field(..., description="YouTube video URL")


class ExtractResponse(BaseModel):
    """Response model for transcript extraction"""
    success: bool
    data: Optional[TranscriptData] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str


# ============================================================================
# Phase 1: Processing Models (Single-Agent)
# ============================================================================

class ProcessRequest(BaseModel):
    """Request model for processing a YouTube video"""
    video_url: str = Field(..., description="YouTube video URL")


class ProcessedResult(BaseModel):
    """Processed lecture notes from video"""
    video_metadata: VideoMetadata
    lecture_notes: str = Field(..., description="Markdown-formatted lecture notes")
    processing_time: float = Field(..., description="Time taken to process (seconds)")


class ProcessResponse(BaseModel):
    """Response model for video processing"""
    success: bool
    data: Optional[ProcessedResult] = None
    error: Optional[str] = None


# ============================================================================
# Phase 2: Multi-Agent Models (LangGraph)
# ============================================================================

class AITool(BaseModel):
    """Individual AI tool extracted from transcript (legacy alias for Concept)"""
    tool_name: str = Field(..., description="Name of the AI tool/framework/library")
    category: str = Field(..., description="Category: framework, library, model, platform, service")
    context_snippet: str = Field(..., description="Brief context where tool was mentioned")
    timestamp: Optional[float] = Field(None, description="Approximate timestamp in video (seconds)")
    confidence_score: float = Field(..., description="Confidence score 0.0-1.0", ge=0.0, le=1.0)
    usage_context: str = Field(..., description="How the tool is being used/discussed")


class Concept(BaseModel):
    """
    Key concept extracted from any educational content.
    Generalized version of AITool that works for all subjects.
    """
    name: str = Field(..., description="Name of the concept, term, person, or entity")
    category: str = Field(
        ...,
        description="Category: term, definition, person, theory, formula, event, tool, framework, book, place, date"
    )
    definition: Optional[str] = Field(None, description="Brief definition or explanation (1-2 sentences)")
    context_snippet: str = Field(..., description="Brief context where it was mentioned (max 100 chars)")
    timestamp: Optional[float] = Field(None, description="Approximate timestamp in video (seconds)")
    confidence_score: float = Field(..., description="Confidence score 0.0-1.0", ge=0.0, le=1.0)
    importance: str = Field("medium", description="Importance level: high, medium, low")


class ContentType(BaseModel):
    """Detected content type of the lecture"""
    primary_type: str = Field(..., description="Primary content type: science, history, business, tech, math, general")
    confidence: float = Field(..., description="Confidence in type detection 0.0-1.0")
    keywords_matched: List[str] = Field(default_factory=list, description="Keywords that matched this type")


# ============================================================================
# Phase 2: Study Tools Models (Flashcards & Quiz)
# ============================================================================

class Flashcard(BaseModel):
    """Individual flashcard generated from lecture content"""
    question: str = Field(..., description="The question or prompt")
    answer: str = Field(..., description="The answer or response")
    concept_name: str = Field(..., description="Name of the related concept")
    difficulty: str = Field("medium", description="Difficulty level: easy, medium, hard")
    category: str = Field(..., description="Category: term, definition, formula, person, event, etc.")


class QuizQuestion(BaseModel):
    """Multiple choice quiz question"""
    question: str = Field(..., description="The quiz question")
    options: List[str] = Field(..., description="4 answer options", min_length=4, max_length=4)
    correct_index: int = Field(..., description="Index of correct answer (0-3)", ge=0, le=3)
    explanation: str = Field(..., description="Explanation of the correct answer")
    concept_name: str = Field(..., description="Name of the related concept")
    difficulty: str = Field("medium", description="Difficulty level: easy, medium, hard")


class StudyMaterials(BaseModel):
    """Complete study materials generated from lecture"""
    flashcards: List[Flashcard] = Field(default_factory=list, description="Generated flashcards")
    quiz_questions: List[QuizQuestion] = Field(default_factory=list, description="Generated quiz questions")


class MultiAgentResult(BaseModel):
    """Complete result from multi-agent processing"""
    video_metadata: VideoMetadata
    lecture_notes: str = Field(..., description="Markdown-formatted lecture notes from Gemini")
    ai_tools: List[AITool] = Field(default_factory=list, description="Legacy: AI tools (backward compat)")
    concepts: List[Concept] = Field(default_factory=list, description="Key concepts extracted by GPT-4o-mini")
    content_type: Optional[ContentType] = Field(None, description="Detected content type of the lecture")
    flashcards: List[Flashcard] = Field(default_factory=list, description="Generated flashcards")
    quiz_questions: List[QuizQuestion] = Field(default_factory=list, description="Generated quiz questions")
    processing_time: float = Field(..., description="Total time taken to process (seconds)")
    agent_execution_order: List[str] = Field(
        default_factory=list,
        description="Order of agent execution for debugging"
    )


class MultiAgentResponse(BaseModel):
    """Response model for multi-agent video processing"""
    success: bool
    data: Optional[MultiAgentResult] = None
    error: Optional[str] = None


# ============================================================================
# Phase 5: History API Models
# ============================================================================

class HistoryItemSummary(BaseModel):
    """Summary of a processing result for history list"""
    id: str = Field(..., description="Processing result UUID")
    video_id: str = Field(..., description="YouTube video ID")
    video_title: str = Field(..., description="Video title")
    channel_name: Optional[str] = Field(None, description="Channel name")
    duration: Optional[int] = Field(None, description="Video duration in seconds")
    ai_tools_count: int = Field(..., description="Number of AI tools extracted")
    processing_time_seconds: float = Field(..., description="Processing time")
    processed_at: str = Field(..., description="ISO timestamp when processed")

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    """Response model for history list endpoint"""
    success: bool
    data: Optional[List[HistoryItemSummary]] = None
    total: int = Field(0, description="Total number of results")
    page: int = Field(1, description="Current page number")
    page_size: int = Field(20, description="Results per page")
    error: Optional[str] = None


class HistoryDetailResponse(BaseModel):
    """Response model for single history item with full details"""
    success: bool
    data: Optional[MultiAgentResult] = None
    processed_at: Optional[str] = Field(None, description="ISO timestamp when processed")
    error: Optional[str] = None


class DeleteHistoryResponse(BaseModel):
    """Response model for delete history endpoint"""
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None


# ============================================================================
# Phase 4: Audio Overview (Podcast) Models
# ============================================================================

class PodcastDialogue(BaseModel):
    """Individual dialogue line in podcast script"""
    speaker: str = Field(..., description="Speaker name: 'Alex' or 'Jordan'")
    text: str = Field(..., description="What the speaker says")


class PodcastScript(BaseModel):
    """Complete podcast script with two hosts"""
    title: str = Field(..., description="Podcast episode title")
    introduction: str = Field(..., description="Brief intro hook (1-2 sentences)")
    dialogue: List[PodcastDialogue] = Field(default_factory=list, description="Back-and-forth dialogue")
    conclusion: str = Field(..., description="Wrap-up and key takeaways")


class PodcastEpisode(BaseModel):
    """Generated podcast episode with audio"""
    script: PodcastScript = Field(..., description="The podcast script")
    audio_base64: Optional[str] = Field(None, description="Base64 encoded MP3 audio")
    duration_seconds: Optional[int] = Field(None, description="Audio duration in seconds")


class PodcastRequest(BaseModel):
    """Request to generate podcast from lecture content"""
    concepts: List[Concept] = Field(..., description="Key concepts to discuss")
    lecture_notes: str = Field(..., description="Lecture notes for context")
    video_title: str = Field("Lecture", description="Title of the source video")


class PodcastResponse(BaseModel):
    """Response with generated podcast"""
    success: bool
    data: Optional[PodcastEpisode] = None
    error: Optional[str] = None
