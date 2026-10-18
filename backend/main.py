"""main.py – FastAPI server exposing /index, /chat, and /health endpoints."""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.runnables import RunnableLambda, RunnablePassthrough, RunnableParallel
from youtube_transcript_api import TranscriptsDisabled, NoTranscriptFound, RequestBlocked, IpBlocked

# ── Load environment variables from project root .env ─────────────────────────
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# ── Local imports ─────────────────────────────────────────────────────────────
from indexing import build_index
from retriever import get_retriever
from augmentation import prompt, format_docs
from generation import llm, parser

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="YouTube ChatBot API", version="1.0.0")

# CORS – allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ─────────────────────────────────────────────────
class IndexRequest(BaseModel):
    url: str

class IndexResponse(BaseModel):
    video_id: str
    chunks: int

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str


# ── RAG chain (LCEL) ──────────────────────────────────────────────────────────
def retrieve(query: str):
    """Retrieve relevant docs – loads the FAISS index fresh each call."""
    return get_retriever().invoke(query)

parallel_chain = RunnableParallel({
    "context": RunnableLambda(retrieve) | RunnableLambda(format_docs),
    "question": RunnablePassthrough(),
})

main_chain = parallel_chain | prompt | llm | parser


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/index", response_model=IndexResponse)
def index_video(request: IndexRequest):
    """Index a YouTube video: fetch transcript → chunk → embed → store."""
    try:
        result = build_index(request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TranscriptsDisabled:
        raise HTTPException(status_code=422, detail="Captions are disabled for this video.")
    except NoTranscriptFound:
        raise HTTPException(status_code=422, detail="No transcript found for this video.")
    except (RequestBlocked, IpBlocked):
        raise HTTPException(status_code=502, detail="YouTube is blocking requests. Try refreshing your cookies.txt.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Ask a question about the indexed video."""
    return {"answer": main_chain.invoke(request.query)}
