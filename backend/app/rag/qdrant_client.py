import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()


class QdrantService:
    _client: QdrantClient | None = None

    def get_client(self) -> QdrantClient:
        if self._client is None:
            self._client = QdrantClient(
                url=os.getenv("QDRANT_URL"),
                api_key=os.getenv("QDRANT_API_KEY"),
            )
        return self._client

    def ensure_collection(self, name: str, vector_size: int = 1024) -> None:
        client = self.get_client()
        existing = [c.name for c in client.get_collections().collections]
        if name not in existing:
            client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )

    def upsert_chunks(self, chunks: list[dict]) -> None:
        client = self.get_client()
        collection = os.getenv("QDRANT_COLLECTION", "book_chunks")
        points = [
            PointStruct(
                id=chunk["id"],
                vector=chunk["embedding"],
                payload={k: chunk.get(k, "") for k in
                         ["doc_id", "content", "chapter_title", "section_title", "url_fragment", "chunk_index"]},
            )
            for chunk in chunks
        ]
        client.upsert(collection_name=collection, points=points)

    def search(self, query_vector: list[float], limit: int = 5, filter: Filter | None = None) -> list[dict]:
        client = self.get_client()
        collection = os.getenv("QDRANT_COLLECTION", "book_chunks")
        results = client.search(
            collection_name=collection,
            query_vector=query_vector,
            limit=limit,
            query_filter=filter,
            with_payload=True,
        )
        return [{"id": str(r.id), "score": r.score, "payload": r.payload} for r in results]

    def count_chunks(self) -> int:
        try:
            collection = os.getenv("QDRANT_COLLECTION", "book_chunks")
            result = self.get_client().count(collection_name=collection, exact=True)
            return result.count
        except Exception:
            return 0
