"""generation.py – LLM configuration for the RAG pipeline."""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser

# ── Load environment variables from project root .env ─────────────────────────
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# ── LLM ───────────────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    temperature=0.2,
)

# ── Output parser ─────────────────────────────────────────────────────────────
parser = StrOutputParser()
