"""indexing.py – Fetch transcript & build FAISS vector store."""

import os, re
from pathlib import Path

import requests
from http.cookiejar import MozillaCookieJar
from dotenv import load_dotenv
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    RequestBlocked,
    IpBlocked,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
# ── Load environment variables from project root .env ─────────────────────────
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# ── Paths ─────────────────────────────────────────────────────────────────────
FAISS_INDEX_DIR = Path(__file__).resolve().parent / "faiss_index"
COOKIES_FILE = Path(__file__).resolve().parent.parent / os.getenv("YOUTUBE_COOKIES_FILE")


# ── Helpers ───────────────────────────────────────────────────────────────────
def get_video_id(url: str) -> str:
    """Extract the video ID from various YouTube URL formats."""
    patterns = [
        r"(?:youtube\.com/watch\?v=)([\w-]{11})",
        r"(?:youtu\.be/)([\w-]{11})",
        r"(?:youtube\.com/shorts/)([\w-]{11})",
        r"(?:youtube\.com/embed/)([\w-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


def _fetch_transcript(video_id: str) -> str:
    """Fetch the transcript using cookies-authenticated session.

    This reuses the exact same cookie-based authentication pattern
    from the original YouTube_ChatBot_Indexing.py script.
    """
    # Build a requests session with browser cookies
    session = requests.Session()
    jar = MozillaCookieJar(str(COOKIES_FILE))
    jar.load(ignore_discard=True, ignore_expires=True)
    session.cookies = jar

    # Fetch transcript via the authenticated session
    api = YouTubeTranscriptApi(http_client=session)
    snippets = api.fetch(video_id, languages=["en", "hi"])
    return " ".join(snippet.text for snippet in snippets)


# ── Main public function ──────────────────────────────────────────────────────
def build_index(url: str) -> dict:
    """End-to-end: URL → transcript → chunks → FAISS index on disk.

    Returns {"video_id": str, "chunks": int}.
    """
    # 1. Extract video ID
    video_id = get_video_id(url)

    # 2. Fetch transcript (reusing the original cookies pattern)
    transcript = _fetch_transcript(video_id)

    # 3. Split into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
    )
    docs = splitter.create_documents([transcript])

    # 4. Embed & build FAISS vector store
   
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    vector_store = FAISS.from_documents(docs, embeddings)

    # 5. Save index to disk (replaces any previous index)
    vector_store.save_local(str(FAISS_INDEX_DIR))

    return {"video_id": video_id, "chunks": len(docs)}
