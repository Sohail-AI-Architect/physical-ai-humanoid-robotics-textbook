import os
import re
import json
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

try:
    from backend.app.models.schemas import Citation
    from backend.app.rag.embeddings import EmbeddingService
    from backend.app.rag.qdrant_client import QdrantService
except ImportError:
    from app.models.schemas import Citation
    from app.rag.embeddings import EmbeddingService
    from app.rag.qdrant_client import QdrantService

GREETING_PATTERNS = re.compile(
    r"^(h(ello|i|ey|ola)|salam|assalam|namaste|kaise ho|kya hal|howdy|yo|sup|good (morning|evening|afternoon)|thanks?|thank you|shukriya)\b",
    re.IGNORECASE,
)

SYSTEM_PROMPT = """You are a friendly, knowledgeable AI teaching assistant for the "Physical AI & Humanoid Robotics" university textbook.

Your personality: Warm, encouraging, and enthusiastic about robotics. You love helping students learn.

## How to respond

**Greetings & casual messages:**
- Reply warmly and introduce yourself: "I'm your AI study companion for the Physical AI & Humanoid Robotics course!"
- Suggest topics the student can ask about (ROS 2, Gazebo, NVIDIA Isaac, VLA models, etc.)
- Return empty citations array for greetings.

**Book-related questions WITH relevant context:**
- Answer thoroughly using the provided context chunks.
- Cite your sources using the chunk metadata.
- Use markdown formatting: **bold**, `code`, code blocks with language tags.
- Be conversational — explain like a helpful tutor, not a dry reference.

**Questions where context is partially relevant:**
- Use whatever context IS relevant and say so.
- Add: "The textbook covers this topic in [chapter]. You might also want to explore..."
- Still provide citations for the parts you did use.

**Questions with NO relevant context:**
- Do NOT say "I cannot answer" or "the context doesn't contain this."
- Instead say: "I don't have specific information about this in the textbook, but here's what I can tell you..." and give a helpful general answer.
- Suggest which textbook chapters might be related.

Format your response as JSON:
{
  "answer": "Your markdown-formatted answer here",
  "citations": [
    {
      "chunk_id": "the chunk id",
      "chapter_title": "Chapter name",
      "section_title": "Section name",
      "url_fragment": "/path/to/page",
      "relevance_score": 0.9
    }
  ]
}

IMPORTANT: Always return valid JSON. Citations array can be empty [] for greetings or when no context was used.
"""

OPENROUTER_BASE = "https://openrouter.ai/api/v1"

LLM_ALIASES = {
    "google/gemini-flash-1.5": "google/gemini-2.0-flash-001",
    "google/gemini-flash-1.5-8b": "google/gemini-2.0-flash-001",
}

SCORE_THRESHOLD = 0.3


class RAGService:
    def __init__(self):
        self.embedding_svc = EmbeddingService()
        self.qdrant_svc = QdrantService()

    def _is_greeting(self, query: str) -> bool:
        return bool(GREETING_PATTERNS.match(query.strip()))

    def _build_context(self, chunks: list[dict]) -> str:
        parts = []
        for i, chunk in enumerate(chunks, 1):
            p = chunk.get("payload", {})
            parts.append(
                f"[Chunk {i}] Chapter: {p.get('chapter_title','Unknown')} | "
                f"Section: {p.get('section_title','Unknown')} | "
                f"Path: {p.get('url_fragment','')}\n\n{p.get('content','')}"
            )
        return "\n\n---\n\n".join(parts)

    def _call_llm(self, messages: list[dict]) -> str:
        raw_model = os.getenv("LLM_MODEL", "google/gemini-2.0-flash-001")
        model = LLM_ALIASES.get(raw_model, raw_model)
        api_key = os.getenv("OPENROUTER_API_KEY")
        resp = httpx.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": 0.4,
                "max_tokens": 1024,
                "response_format": {"type": "json_object"},
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

    def answer(self, query: str, scope: str = "global", selected_text: str | None = None) -> tuple[str, list[Citation]]:
        # Handle greetings without retrieval
        if self._is_greeting(query):
            try:
                raw = self._call_llm([
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"The student said: \"{query}\"\n\nThis is a greeting or casual message. Respond warmly."},
                ])
                data = json.loads(raw)
                return data.get("answer", "Hello! I'm your AI study companion. Ask me anything about Physical AI & Humanoid Robotics!"), []
            except Exception:
                return ("Hello! 👋 I'm your AI study companion for the Physical AI & Humanoid Robotics course. Ask me about ROS 2, Gazebo simulation, NVIDIA Isaac, or any topic in the textbook!", [])

        # Retrieval for actual questions
        if scope == "selected_text" and selected_text:
            query_vec = self.embedding_svc.embed_text(selected_text)
            chunks = self.qdrant_svc.search(query_vec, limit=8)
            # Filter by score threshold
            chunks = [c for c in chunks if c.get("score", 0) >= SCORE_THRESHOLD]
            selected_chunk = {
                "id": "selected", "score": 1.0,
                "payload": {"doc_id": "selection", "content": selected_text,
                            "chapter_title": "Selected Text", "section_title": "User Selection",
                            "url_fragment": "#", "chunk_index": 0},
            }
            chunks = [selected_chunk] + chunks[:4]
        else:
            query_vec = self.embedding_svc.embed_text(query)
            chunks = self.qdrant_svc.search(query_vec, limit=8)
            # Filter by score threshold
            chunks = [c for c in chunks if c.get("score", 0) >= SCORE_THRESHOLD]

        # Build context — even if empty, let LLM handle gracefully
        if chunks:
            context = self._build_context(chunks)
            user_msg = f"Context from textbook:\n\n{context}\n\nStudent's question: {query}"
        else:
            user_msg = f"No relevant textbook context was found for this question.\n\nStudent's question: {query}"

        try:
            raw = self._call_llm([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ])
            data = json.loads(raw)
            citations = [
                Citation(
                    chunk_id=c.get("chunk_id", ""),
                    chapter_title=c.get("chapter_title", ""),
                    section_title=c.get("section_title", ""),
                    url_fragment=c.get("url_fragment", ""),
                    relevance_score=float(c.get("relevance_score", 0.0)),
                )
                for c in data.get("citations", [])
            ]
            return data.get("answer", ""), citations
        except Exception as e:
            return (f"Error formatting response: {type(e).__name__}. Please try again.", [])
