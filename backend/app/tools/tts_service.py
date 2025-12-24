"""
ElevenLabs TTS Service
Converts podcast scripts to audio using ElevenLabs text-to-speech

Black box interface:
- Input: PodcastScript with dialogue
- Output: Base64 encoded MP3 audio

Uses pydub to concatenate individual audio segments with natural pauses.
"""
import os
import base64
import io
from typing import Optional
from pydub import AudioSegment

from app.models import PodcastScript


class TTSService:
    """
    Text-to-speech service using ElevenLabs API.
    Generates audio for each dialogue line and concatenates into single MP3.
    """

    # Voice IDs for the two hosts
    VOICES = {
        "Alex": "JBFqnCBsd6RMkjVDRZzb",    # George - warm British male
        "Jordan": "EXAVITQu4vr4xnSDxMaL",  # Bella - conversational female
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

    def generate_podcast_audio(self, script: PodcastScript) -> tuple[str, int]:
        """
        Generate audio for the entire podcast script.

        Args:
            script: PodcastScript with dialogue

        Returns:
            Tuple of (base64 encoded MP3 string, duration in seconds)
        """
        # Combine all text parts
        all_segments = []

        # Introduction (spoken by Alex as the host)
        if script.introduction:
            intro_audio = self._generate_speech(script.introduction, "Alex")
            if intro_audio:
                all_segments.append(intro_audio)
                all_segments.append(self._create_silence(self.SPEAKER_PAUSE_MS))

        # Dialogue
        for dialogue in script.dialogue:
            speaker = dialogue.speaker
            text = dialogue.text

            if speaker not in self.VOICES:
                speaker = "Alex"  # Default to Alex if unknown speaker

            audio = self._generate_speech(text, speaker)
            if audio:
                all_segments.append(audio)
                all_segments.append(self._create_silence(self.SPEAKER_PAUSE_MS))

        # Conclusion (spoken by Alex)
        if script.conclusion:
            conclusion_audio = self._generate_speech(script.conclusion, "Alex")
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

    def _generate_speech(self, text: str, speaker: str) -> Optional[AudioSegment]:
        """
        Generate speech for a single text segment.

        Args:
            text: Text to convert to speech
            speaker: Speaker name (Alex or Jordan)

        Returns:
            AudioSegment or None if failed
        """
        if not text.strip():
            return None

        voice_id = self.VOICES.get(speaker, self.VOICES["Alex"])

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
