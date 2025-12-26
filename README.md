<div align="center">

# LectureFlow

**AI-Powered Lecture Notes Generator with Multi-Agent Orchestration**

Transform any YouTube lecture into comprehensive notes, flashcards, quizzes, and podcast discussions.

[![CI](https://github.com/ukimsanov/lectureflow/actions/workflows/ci.yml/badge.svg)](https://github.com/ukimsanov/lectureflow/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.0-purple)](https://github.com/langchain-ai/langgraph)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Live Demo](https://lectureflow.ularkimsanov7.workers.dev) · [API Docs](https://4k6qhzh138.execute-api.us-east-1.amazonaws.com/docs)

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Real-Time Streaming** | ChatGPT-style SSE streaming shows notes generating live |
| **Multi-Agent AI** | LangGraph orchestrates 3 agents running in parallel |
| **Smart Caching** | 99% cost reduction on repeat videos (7-day cache) |
| **Study Tools** | Auto-generated flashcards and quizzes |
| **Audio Podcast** | NotebookLM-style two-host discussions |
| **PDF Export** | Download professional markdown-formatted notes |

---

## Tech Stack

### Frontend
- **Next.js 15** with App Router and Server Components
- **React 19** with Streaming SSR
- **Tailwind CSS v4** with OKLCH colors
- **shadcn/ui** + **Magic UI** for animations

### Backend
- **FastAPI** with async/await
- **LangGraph 1.0** multi-agent orchestration
- **Gemini 2.5 Flash** for summarization
- **GPT-4o-mini** for concept extraction
- **ElevenLabs** for podcast TTS

### Infrastructure
- **PostgreSQL** (Neon) with SQLAlchemy 2.0
- **AWS Lambda** for serverless backend API
- **Cloudflare Workers** for frontend hosting

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                     │
│  EventSource SSE → Real-time streaming UI                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LangGraph StateGraph                    │    │
│  │                                                      │    │
│  │    Agent 1: Transcript Extractor                    │    │
│  │         │                                            │    │
│  │         ├────────────┬────────────┐                 │    │
│  │         ▼            ▼            ▼                 │    │
│  │    Agent 2:     Agent 3:     Agent 4:              │    │
│  │    Notes Gen    Concepts     Study Tools           │    │
│  │    (Gemini)     (GPT-4o)     (GPT-4o)              │    │
│  │    [PARALLEL]   [PARALLEL]   [ON-DEMAND]           │    │
│  │         │            │            │                 │    │
│  │         └────────────┴────────────┘                 │    │
│  │                      │                               │    │
│  │                      ▼                               │    │
│  │              Save to PostgreSQL                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (or [Neon](https://neon.tech) free tier)
- API Keys: [Gemini](https://aistudio.google.com/app/apikey), [OpenAI](https://platform.openai.com/api-keys), [ElevenLabs](https://elevenlabs.io)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/process/stream` | SSE streaming processing |
| `POST` | `/api/study-materials/generate` | Generate flashcards & quiz |
| `POST` | `/api/podcast/generate` | Generate audio podcast |
| `GET` | `/api/history` | List processing history |
| `GET` | `/api/presets` | Demo video presets |

Full API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Deployment

### AWS Lambda (Serverless)

```bash
cd backend
sam build
sam deploy --guided
```

See [template.yaml](backend/template.yaml) for infrastructure configuration.

### Cloudflare Workers (Frontend)

```bash
cd frontend
npm install
npm run deploy
```

Environment variables are configured in `wrangler.toml`.

---

## Project Structure

```
lectureflow/
├── frontend/                 # Next.js 15 application
│   ├── src/app/             # App Router pages
│   ├── src/components/      # React components
│   └── src/types/           # TypeScript types
└── backend/                  # FastAPI application
    ├── app/
    │   ├── main.py          # FastAPI app & endpoints
    │   ├── models.py        # Pydantic models
    │   ├── agents/          # LangGraph orchestration
    │   ├── tools/           # AI processing tools
    │   └── database/        # SQLAlchemy models
    ├── template.yaml        # AWS SAM template
    └── Dockerfile           # Container deployment
```

---

## Performance

| Metric | Value |
|--------|-------|
| Fresh processing | 15-30 seconds |
| Cached processing | < 1 second |
| Lambda cold start | ~700ms (SnapStart) |
| Cost savings | 99% on repeat videos |

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with [LangGraph](https://github.com/langchain-ai/langgraph) · [FastAPI](https://fastapi.tiangolo.com) · [Next.js](https://nextjs.org)

</div>
