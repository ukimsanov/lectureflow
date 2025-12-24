# LectureFlow - Master Implementation Plan

> **Goal:** Portfolio showcase with full product quality
> **Scope:** All educational content (not just AI/Tech)
> **Last Updated:** December 21, 2025

---

## Executive Summary

Transform LectureFlow from an AI-niche demo into a **complete learning platform** that competes with NotebookLM, NoteGPT, and Mindgrasp.

### Why This Pivot?

1. **Current AI-only extraction limits usefulness** to ~5% of YouTube educational content
2. **Market is saturated** with free alternatives (NotebookLM is free and does more)
3. **Portfolio value increases** by showing full product thinking

---

## Competitive Analysis

| Feature | LectureFlow | NotebookLM | NoteGPT | Mindgrasp |
|---------|-------------|------------|---------|-----------|
| YouTube Notes | Yes | Yes | Yes | Yes |
| Real-time Streaming | **Yes (unique!)** | No | No | No |
| Audio Podcast | Planned | **Yes (viral)** | No | No |
| Flashcards | Planned | Yes | Yes | Yes |
| Quizzes | Planned | Yes | Yes | Yes |
| Mind Maps | Planned | Yes | No | Yes |
| Spaced Repetition | Planned | No | No | No |
| Chat with Content | Planned | Yes | Yes | Yes |
| All Content Types | **Planned** | Yes | Yes | Yes |

**Our Differentiator:** Real-time streaming UX + comprehensive study tools + open architecture

---

## Implementation Phases

### Phase 1: Foundation (Current)

**Goal:** Make the app work for ANY educational content

| Task | Status | Files |
|------|--------|-------|
| Add `Concept` model (replaces AITool) | In Progress | `backend/app/models.py` |
| Create `concept_extractor.py` | Pending | `backend/app/tools/concept_extractor.py` |
| Content type detection | Pending | Backend agent |
| Update frontend labels | Pending | `AIToolsGrid.tsx` → `ConceptsGrid.tsx` |
| Add timestamps to notes | Pending | Backend + frontend |

**Content Types to Support:**
- Science: Formulas, theories, scientists, experiments
- History: Dates, events, figures, causes/effects
- Business: Frameworks, case studies, metrics
- Tech: Tools, libraries, architectures
- Math: Formulas, proofs, theorems
- General: Key terms, definitions, quotes

---

### Phase 2: Study Tools

**Goal:** Add flashcards and quizzes for active recall

| Task | Files to Create |
|------|-----------------|
| Flashcard generation agent | `backend/app/tools/flashcard_generator.py` |
| Quiz generation agent | `backend/app/tools/quiz_generator.py` |
| Flashcard UI (flip cards) | `frontend/src/components/flashcards/` |
| Quiz UI (interactive) | `frontend/src/components/quiz/` |

**Data Models:**
```typescript
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp?: number;
}

interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}
```

---

### Phase 3: Spaced Repetition

**Goal:** Help users retain knowledge with scientifically-proven review scheduling

| Task | Details |
|------|---------|
| FSRS Algorithm | Free Spaced Repetition Scheduler (most accurate) |
| Review Queue UI | Daily cards to review |
| Progress Tracking | Stats and streaks |

**Database Tables:**
```sql
CREATE TABLE user_flashcard_progress (
  id UUID PRIMARY KEY,
  flashcard_id UUID,
  next_review TIMESTAMP,
  ease_factor FLOAT,
  interval_days INTEGER,
  repetitions INTEGER
);
```

---

### Phase 4: Audio Overview (Podcast)

**Goal:** Generate engaging podcast discussions about lectures (what made NotebookLM viral)

| Task | Details |
|------|---------|
| Podcast script agent | Two AI hosts discuss the content |
| TTS integration | Google TTS or ElevenLabs |
| Audio player UI | Playback controls, speed adjustment |

**Why This Matters:**
- 72% of users prefer audio over reading for initial familiarization
- This is what made NotebookLM go viral on social media
- Unique differentiator in the market

---

### Phase 5: Chat with Lecture

**Goal:** Let users ask follow-up questions about the content

| Task | Details |
|------|---------|
| RAG implementation | Vector DB (Pinecone or Chroma) |
| Semantic chunking | Break transcript into meaningful pieces |
| Chat UI | Sidebar while viewing notes |

---

### Phase 6: Polish & Export

| Task | Details |
|------|---------|
| Mind map generation | Mermaid.js or ReactFlow |
| Export to Notion | Markdown with proper formatting |
| Export to Obsidian | Wikilinks format |
| Export to Anki | Flashcard deck format |

---

## Database Schema Changes

```sql
-- New tables for Phase 2+

CREATE TABLE flashcards (
  id UUID PRIMARY KEY,
  processing_result_id UUID REFERENCES processing_results(id),
  question TEXT,
  answer TEXT,
  difficulty VARCHAR(20),
  timestamp_seconds INTEGER
);

CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  processing_result_id UUID REFERENCES processing_results(id),
  questions JSONB
);

CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY,
  processing_result_id UUID REFERENCES processing_results(id),
  audio_url TEXT,
  duration_seconds INTEGER,
  script TEXT
);
```

---

## New Component Structure

```
frontend/src/components/
├── processing/           # Existing
│   ├── ConceptsGrid.tsx  # Renamed from AIToolsGrid
│   └── ...
├── flashcards/           # Phase 2
│   ├── FlashcardDeck.tsx
│   ├── FlashcardCard.tsx
│   └── ReviewSession.tsx
├── quiz/                 # Phase 2
│   ├── QuizContainer.tsx
│   ├── QuizQuestion.tsx
│   └── QuizResults.tsx
├── podcast/              # Phase 4
│   ├── AudioPlayer.tsx
│   └── PodcastGenerator.tsx
├── chat/                 # Phase 5
│   └── LectureChat.tsx
└── mindmap/              # Phase 6
    └── MindMapViewer.tsx
```

---

## Backend Agent Structure

```
backend/app/tools/
├── youtube_tool.py       # Transcript extraction
├── summarizer.py         # Gemini notes generation
├── concept_extractor.py  # NEW: Generalized extraction
├── flashcard_generator.py # Phase 2
├── quiz_generator.py     # Phase 2
├── podcast_generator.py  # Phase 4
└── chat_agent.py         # Phase 5 (RAG)
```

---

## Success Metrics

1. **Phase 1 Complete:** App works for history/science/business lectures
2. **Phase 2 Complete:** Users can generate and study flashcards
3. **Phase 3 Complete:** Spaced repetition keeps users coming back
4. **Phase 4 Complete:** Podcast feature generates buzz on social media
5. **Phase 5 Complete:** Users can ask questions about any lecture

---

## Resources & References

### Competitors Studied
- [NotebookLM](https://notebooklm.google/) - Audio Overview feature went viral
- [NoteGPT](https://notegpt.io/) - 4.9 stars, good UX
- [Mindgrasp](https://www.mindgrasp.ai/) - Comprehensive learning platform
- [Knowt](https://knowt.com/) - Best spaced repetition for students

### Tech References
- [FSRS Algorithm](https://github.com/open-spaced-repetition/fsrs4anki) - Spaced repetition
- [ElevenLabs](https://elevenlabs.io/) - High-quality TTS
- [Mermaid.js](https://mermaid.js.org/) - Mind map generation
