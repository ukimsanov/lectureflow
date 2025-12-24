"""
Tools package for LectureFlow
"""
from app.tools.youtube_tool import YouTubeTranscriptExtractor
from app.tools.summarizer import LectureSummarizer
from app.tools.concept_extractor import ConceptExtractor
from app.tools.flashcard_generator import FlashcardGenerator
from app.tools.quiz_generator import QuizGenerator
from app.tools.podcast_generator import PodcastScriptGenerator
from app.tools.tts_service import TTSService

# Backward compatibility alias
AIToolExtractor = ConceptExtractor

__all__ = [
    'YouTubeTranscriptExtractor',
    'LectureSummarizer',
    'ConceptExtractor',
    'AIToolExtractor',  # Backward compatibility
    'FlashcardGenerator',
    'QuizGenerator',
    'PodcastScriptGenerator',
    'TTSService',
]
