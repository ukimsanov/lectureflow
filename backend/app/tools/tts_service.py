"""
ElevenLabs TTS Service
Converts podcast scripts to audio using ElevenLabs text-to-speech

Black box interface:
- Input: PodcastScript with dialogue
- Output: Base64 encoded MP3 audio

Uses pydub to concatenate individual audio segments with natural pauses.
Supports automatic language detection for multilingual podcasts.
"""
import os
import base64
import io
import re
from typing import Optional
from pydub import AudioSegment

from app.models import PodcastScript


class TTSService:
    """
    Text-to-speech service using ElevenLabs API.
    Generates audio for each dialogue line and concatenates into single MP3.
    Automatically detects language and selects appropriate voices.
    """

    # Voice IDs by language - using ElevenLabs multilingual voices
    # Format: {language: {speaker: voice_id}}
    VOICES_BY_LANGUAGE = {
        "en": {  # English
            "Alex": "JBFqnCBsd6RMkjVDRZzb",    # George - warm British male
            "Jordan": "EXAVITQu4vr4xnSDxMaL",  # Bella - conversational female
        },
        "ru": {  # Russian
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel - works well for Russian
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda - natural multilingual female
        },
        "es": {  # Spanish
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda
        },
        "fr": {  # French
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda
        },
        "de": {  # German
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda
        },
        "zh": {  # Chinese
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda
        },
        "ja": {  # Japanese
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda
        },
        "ko": {  # Korean
            "Alex": "onwK4e9ZLuTAKqWW03F9",    # Daniel
            "Jordan": "XrExE9yKIg1WjnnlVkGX",  # Matilda
        },
    }

    # Default/fallback voices (English)
    VOICES = {
        "Alex": "JBFqnCBsd6RMkjVDRZzb",
        "Jordan": "EXAVITQu4vr4xnSDxMaL",
    }

    # Model for best quality
    MODEL = "eleven_multilingual_v2"

    # Pause duration between speakers (milliseconds)
    SPEAKER_PAUSE_MS = 300

    def __init__(self):
        """Initialize with ElevenLabs client."""
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY must be set in environment")

        # Import here to avoid issues if elevenlabs not installed
        from elevenlabs.client import ElevenLabs
        self.client = ElevenLabs(api_key=api_key)
        self._detected_language = "en"  # Default language

    def detect_language(self, text: str) -> str:
        """
        Detect the primary language of the text.
        Uses character-based detection for efficiency.

        Args:
            text: Text to analyze

        Returns:
            Language code (en, ru, es, fr, de, zh, ja, ko)
        """
        if not text:
            return "en"

        # Count character types
        cyrillic_count = len(re.findall(r'[\u0400-\u04FF]', text))
        chinese_count = len(re.findall(r'[\u4e00-\u9fff]', text))
        japanese_count = len(re.findall(r'[\u3040-\u309f\u30a0-\u30ff]', text))
        korean_count = len(re.findall(r'[\uac00-\ud7af]', text))
        latin_count = len(re.findall(r'[a-zA-Z]', text))

        # Get total alphabetic characters
        total = cyrillic_count + chinese_count + japanese_count + korean_count + latin_count
        if total == 0:
            return "en"

        # Determine language based on character ratios
        if cyrillic_count / total > 0.3:
            return "ru"
        if chinese_count / total > 0.3:
            return "zh"
        if japanese_count / total > 0.1:
            return "ja"
        if korean_count / total > 0.3:
            return "ko"

        # For Latin-based languages, use common word detection
        text_lower = text.lower()

        # Spanish indicators
        spanish_words = ['que', 'de', 'el', 'la', 'los', 'las', 'es', 'en', 'por', 'con', 'para', 'está']
        spanish_score = sum(1 for word in spanish_words if f' {word} ' in f' {text_lower} ')

        # French indicators
        french_words = ['le', 'la', 'les', 'de', 'du', 'des', 'est', 'sont', 'avec', 'pour', 'dans', 'que']
        french_score = sum(1 for word in french_words if f' {word} ' in f' {text_lower} ')

        # German indicators
        german_words = ['der', 'die', 'das', 'und', 'ist', 'sind', 'mit', 'für', 'auf', 'ein', 'eine']
        german_score = sum(1 for word in german_words if f' {word} ' in f' {text_lower} ')

        # Check for special characters
        if 'ñ' in text_lower or '¿' in text or '¡' in text:
            return "es"
        if 'ç' in text_lower or 'œ' in text_lower:
            return "fr"
        if 'ß' in text_lower or 'ü' in text_lower or 'ö' in text_lower or 'ä' in text_lower:
            return "de"

        # Use word scores if significant
        max_score = max(spanish_score, french_score, german_score)
        if max_score >= 3:
            if spanish_score == max_score:
                return "es"
            if french_score == max_score:
                return "fr"
            if german_score == max_score:
                return "de"

        return "en"

    def get_voices_for_language(self, language: str) -> dict:
        """
        Get appropriate voice IDs for the detected language.

        Args:
            language: Language code

        Returns:
            Dict mapping speaker names to voice IDs
        """
        return self.VOICES_BY_LANGUAGE.get(language, self.VOICES)

    def generate_podcast_audio(self, script: PodcastScript) -> tuple[str, int]:
        """
        Generate audio for the entire podcast script.
        Automatically detects language and selects appropriate voices.

        Args:
            script: PodcastScript with dialogue

        Returns:
            Tuple of (base64 encoded MP3 string, duration in seconds)
        """
        # Detect language from script content
        all_text = script.introduction + " " + script.conclusion
        for dialogue in script.dialogue:
            all_text += " " + dialogue.text

        self._detected_language = self.detect_language(all_text)
        voices = self.get_voices_for_language(self._detected_language)
        print(f"🌍 Detected language: {self._detected_language}")

        # Combine all text parts
        all_segments = []

        # Introduction (spoken by Alex as the host)
        if script.introduction:
            intro_audio = self._generate_speech(script.introduction, "Alex", voices)
            if intro_audio:
                all_segments.append(intro_audio)
                all_segments.append(self._create_silence(self.SPEAKER_PAUSE_MS))

        # Dialogue
        for dialogue in script.dialogue:
            speaker = dialogue.speaker
            text = dialogue.text

            if speaker not in voices:
                speaker = "Alex"  # Default to Alex if unknown speaker

            audio = self._generate_speech(text, speaker, voices)
            if audio:
                all_segments.append(audio)
                all_segments.append(self._create_silence(self.SPEAKER_PAUSE_MS))

        # Conclusion (spoken by Alex)
        if script.conclusion:
            conclusion_audio = self._generate_speech(script.conclusion, "Alex", voices)
            if conclusion_audio:
                all_segments.append(conclusion_audio)

        # Concatenate all segments
        if not all_segments:
            return "", 0

        combined = all_segments[0]
        for segment in all_segments[1:]:
            combined = combined + segment

        # Export to MP3
        buffer = io.BytesIO()
        combined.export(buffer, format="mp3", bitrate="128k")
        buffer.seek(0)

        # Calculate duration
        duration_seconds = len(combined) // 1000  # pydub length is in ms

        # Encode to base64
        audio_base64 = base64.b64encode(buffer.read()).decode("utf-8")

        return audio_base64, duration_seconds

    def _generate_speech(self, text: str, speaker: str, voices: Optional[dict] = None) -> Optional[AudioSegment]:
        """
        Generate speech for a single text segment.

        Args:
            text: Text to convert to speech
            speaker: Speaker name (Alex or Jordan)
            voices: Optional dict mapping speaker names to voice IDs

        Returns:
            AudioSegment or None if failed
        """
        if not text.strip():
            return None

        # Use provided voices or fall back to defaults
        voice_map = voices if voices else self.VOICES
        voice_id = voice_map.get(speaker, voice_map.get("Alex", self.VOICES["Alex"]))

        try:
            # Generate audio using ElevenLabs
            audio_generator = self.client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id=self.MODEL,
                output_format="mp3_44100_128",
            )

            # Convert generator to bytes
            audio_bytes = b"".join(audio_generator)

            # Load into pydub
            audio_segment = AudioSegment.from_mp3(io.BytesIO(audio_bytes))

            return audio_segment

        except Exception as e:
            print(f"Error generating speech for {speaker}: {e}")
            return None

    def _create_silence(self, duration_ms: int) -> AudioSegment:
        """Create a silent audio segment."""
        return AudioSegment.silent(duration=duration_ms)

    def estimate_duration(self, script: PodcastScript) -> int:
        """
        Estimate podcast duration based on character count.
        Average speaking rate is ~150 words/min or ~750 chars/min.

        Args:
            script: PodcastScript to estimate

        Returns:
            Estimated duration in seconds
        """
        total_chars = len(script.introduction) + len(script.conclusion)
        for dialogue in script.dialogue:
            total_chars += len(dialogue.text)

        # Add pause time
        pause_time_seconds = len(script.dialogue) * (self.SPEAKER_PAUSE_MS / 1000)

        # Estimate speaking time (750 chars/min = 12.5 chars/sec)
        speaking_time_seconds = total_chars / 12.5

        return int(speaking_time_seconds + pause_time_seconds)

    def estimate_cost(self, script: PodcastScript) -> float:
        """
        Estimate ElevenLabs API cost for the script.
        Pricing: ~$0.20 per 1000 characters

        Args:
            script: PodcastScript to estimate

        Returns:
            Estimated cost in USD
        """
        total_chars = len(script.introduction) + len(script.conclusion)
        for dialogue in script.dialogue:
            total_chars += len(dialogue.text)

        return (total_chars / 1000) * 0.20
