"""
YouTube Transcript Extraction Tool
Adapted from original implementation, cleaned for FastAPI usage
"""
import re
from typing import Dict, List, Optional, Any
from youtube_transcript_api import YouTubeTranscriptApi
import yt_dlp

from app.models import TranscriptChunk, VideoMetadata, TranscriptData


class YouTubeTranscriptExtractor:
    """
    Extracts transcripts and metadata from YouTube videos.

    Black box interface:
    - Input: YouTube URL (string)
    - Output: TranscriptData (metadata + chunks + full text)

    No internal implementation details exposed.
    """

    def extract(self, video_url: str) -> TranscriptData:
        """
        Main interface: Extract transcript and metadata from YouTube video.

        Args:
            video_url: Valid YouTube URL

        Returns:
            TranscriptData with metadata, chunks, and full text

        Raises:
            ValueError: If URL is invalid or transcript unavailable
            Exception: For other extraction failures
        """
        # Extract video ID
        video_id = self._extract_video_id(video_url)
        if not video_id:
            raise ValueError("Invalid YouTube URL format")

        # Get video metadata
        metadata_dict = self._get_video_metadata(video_url, video_id)

        # Get transcript
        transcript_raw = self._get_transcript(video_id)
        if not transcript_raw:
            raise ValueError("No transcript available for this video")

        # Process into chunks and full text
        full_text = self._build_full_text(transcript_raw)
        chunks = self._create_chunks(transcript_raw, video_id)

        # Build metadata object
        metadata = VideoMetadata(
            video_id=video_id,
            video_title=metadata_dict.get('title', 'Unknown Title'),
            video_url=video_url,
            channel_name=metadata_dict.get('uploader', 'Unknown Channel'),
            duration=metadata_dict.get('duration')
        )

        return TranscriptData(
            metadata=metadata,
            transcript_chunks=chunks,
            full_text=full_text
        )

    # ============================================================================
    # PRIVATE METHODS - Implementation details hidden from interface
    # ============================================================================

    def _extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats"""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'(?:v\/)([0-9A-Za-z_-]{11})'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def _get_video_metadata(self, video_url: str, video_id: str) -> Dict[str, Any]:
        """Get video metadata using yt-dlp (minimal extraction)"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
                'extract_flat': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                if info is None:
                    return {'title': f'Video {video_id}', 'uploader': 'Unknown'}

                return {
                    'title': info.get('title', 'Unknown Title'),
                    'uploader': info.get('uploader', 'Unknown Channel'),
                    'duration': info.get('duration')
                }
        except Exception as e:
            print(f"Warning: Could not fetch metadata: {e}")
            return {'title': f'Video {video_id}', 'uploader': 'Unknown'}

    def _get_transcript(self, video_id: str) -> Optional[List[Dict]]:
        """Get transcript using youtube-transcript-api v1.2.3"""
        try:
            api = YouTubeTranscriptApi()

            # Try to get list of available transcripts first
            try:
                transcript_list = api.list(video_id)
                available_transcripts = list(transcript_list)
                print(f"📝 Available transcripts: {[t.language_code for t in available_transcripts]}")
            except Exception as e:
                print(f"Could not list transcripts: {e}")
                available_transcripts = []

            # Priority order for languages
            preferred_languages = ['en', 'en-US', 'en-GB', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ko']

            # Try preferred languages first
            for lang in preferred_languages:
                try:
                    transcript_data = api.fetch(video_id, languages=[lang])
                    print(f"✅ Found transcript in: {lang}")
                    return [
                        {"text": item.text, "start": item.start}
                        for item in transcript_data
                    ]
                except Exception:
                    continue

            # If no preferred language found, try any available transcript
            if available_transcripts:
                for transcript in available_transcripts:
                    try:
                        transcript_data = api.fetch(video_id, languages=[transcript.language_code])
                        print(f"✅ Found transcript in: {transcript.language_code}")
                        return [
                            {"text": item.text, "start": item.start}
                            for item in transcript_data
                        ]
                    except Exception:
                        continue

            print(f"❌ No transcript available for video {video_id}")
            return None

        except Exception as e:
            print(f"Transcript extraction failed: {e}")
            return None

    def _build_full_text(self, transcript_data: List[Dict]) -> str:
        """Combine all transcript segments into formatted text with paragraph breaks"""
        if not transcript_data:
            return ""

        paragraphs = []
        current_paragraph = []

        for i, item in enumerate(transcript_data):
            current_paragraph.append(item['text'])

            # Add paragraph break if there's a pause > 2 seconds or after ~5 sentences
            if i < len(transcript_data) - 1:
                gap = transcript_data[i + 1]['start'] - item['start']
                text_so_far = ' '.join(current_paragraph)
                sentence_count = text_so_far.count('.') + text_so_far.count('?') + text_so_far.count('!')

                if gap > 2.0 or sentence_count >= 5:
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []

        # Add remaining text
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))

        return '\n\n'.join(paragraphs)

    def _create_chunks(
        self,
        transcript_data: List[Dict],
        video_id: str
    ) -> List[TranscriptChunk]:
        """
        Create transcript chunks with timestamps.
        For Phase 0, we'll keep it simple - just group by time intervals.
        """
        chunks = []
        chunk_duration = 60  # 60 seconds per chunk
        current_chunk_text = []
        current_chunk_start = 0
        chunk_index = 0

        for item in transcript_data:
            start_time = item['start']

            # Start new chunk if we've exceeded duration
            if start_time >= (chunk_index + 1) * chunk_duration:
                if current_chunk_text:
                    chunks.append(TranscriptChunk(
                        chunk_id=f"{video_id}_chunk_{chunk_index + 1}",
                        text=" ".join(current_chunk_text),
                        start_time=current_chunk_start
                    ))
                    chunk_index += 1
                    current_chunk_text = []
                    current_chunk_start = start_time

            current_chunk_text.append(item['text'])

        # Add final chunk
        if current_chunk_text:
            chunks.append(TranscriptChunk(
                chunk_id=f"{video_id}_chunk_{chunk_index + 1}",
                text=" ".join(current_chunk_text),
                start_time=current_chunk_start
            ))

        return chunks
