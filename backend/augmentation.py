"""augmentation.py – Prompt template & context formatting for RAG."""

from langchain_core.prompts import ChatPromptTemplate

# ── Prompt template ───────────────────────────────────────────────────────────
prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a helpful assistant that answers questions about a YouTube video. "
        "Answer ONLY from the provided video transcript context below. "
        "If the answer is not found in the context, say: "
        "'I could not find the answer in this video.' "
        "Do NOT make things up or use outside knowledge.\n\n"
        "CONTEXT:\n{context}",
    ),
    ("human", "{question}"),
])


def format_docs(docs) -> str:
    """Join retrieved document chunks into a single context string."""
    return "\n\n".join(doc.page_content for doc in docs)
