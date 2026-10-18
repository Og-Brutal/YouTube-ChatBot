"""retriever.py – Load the FAISS index and return a retriever."""

from pathlib import Path

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# ── Load environment variables from project root .env ─────────────────────────
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

FAISS_INDEX_DIR = Path(__file__).resolve().parent / "faiss_index"


def get_retriever():
    """Load FAISS index from disk and return a LangChain retriever.

    Loads fresh from disk on every call so that a newly indexed
    video is picked up without restarting the server.
    """
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.load_local(
        str(FAISS_INDEX_DIR),
        embeddings,
        allow_dangerous_deserialization=True,
    )
    return vector_store.as_retriever(search_kwargs={"k": 4})
