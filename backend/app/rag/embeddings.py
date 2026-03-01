import os
import cohere
from dotenv import load_dotenv

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

    def embed_text(self, text: str) -> list[float]:
        model = self._resolve_model()
        response = self._get_client().embed(
            texts=[text],
            model=model,
            input_type="search_query",
        )
        return response.embeddings[0]

    def embed_batch(self, texts: list[str], input_type: str = "search_document") -> list[list[float]]:
        model = self._resolve_model()
        response = self._get_client().embed(
            texts=texts,
            model=model,
            input_type=input_type,
        )
        return response.embeddings
