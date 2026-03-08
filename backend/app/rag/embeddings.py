import os
import time
import logging
import cohere
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()  # fallback to .env


MODEL_ALIASES = {
    "cohere-embed-english-v3": "embed-english-v3.0",
    "cohere-embed-english-v3.0": "embed-english-v3.0",
}


class EmbeddingService:
    _client: cohere.Client | None = None

    def _get_client(self) -> cohere.Client:
        if self._client is None:
            self._client = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))
        return self._client

    def _resolve_model(self) -> str:
        raw = os.getenv("EMBEDDING_MODEL", "embed-english-v3.0")
        return MODEL_ALIASES.get(raw, raw)

    def embed_text(self, text: str, max_retries: int = 3) -> list[float]:
        model = self._resolve_model()
        last_exc: Exception | None = None
        for attempt in range(max_retries):
            try:
                response = self._get_client().embed(
                    texts=[text],
                    model=model,
                    input_type="search_query",
                )
                return response.embeddings[0]
            except Exception as exc:
                logger.warning("Cohere embed_text attempt %d failed: %s", attempt + 1, exc)
                last_exc = exc
                time.sleep(min(2 ** attempt, 8))
        raise last_exc or RuntimeError("Embedding failed after retries")

    def embed_batch(self, texts: list[str], input_type: str = "search_document", max_retries: int = 3) -> list[list[float]]:
        model = self._resolve_model()
        last_exc: Exception | None = None
        for attempt in range(max_retries):
            try:
                response = self._get_client().embed(
                    texts=texts,
                    model=model,
                    input_type=input_type,
                )
                return response.embeddings
            except Exception as exc:
                logger.warning("Cohere embed_batch attempt %d failed: %s", attempt + 1, exc)
                last_exc = exc
                time.sleep(min(2 ** attempt, 8))
        raise last_exc or RuntimeError("Batch embedding failed after retries")
