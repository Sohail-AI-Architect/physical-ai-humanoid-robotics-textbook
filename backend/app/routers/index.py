import os
import time
from fastapi import APIRouter, BackgroundTasks

from backend.app.models.schemas import HealthResponse, IndexRebuildResponse
from backend.app.rag.qdrant_client import QdrantService

router = APIRouter()
qdrant_service = QdrantService()


@router.get("/health", response_model=HealthResponse)
async def health():
    collection = os.getenv("QDRANT_COLLECTION", "book_chunks")
    return HealthResponse(
        status="ok",
        total_chunks=qdrant_service.count_chunks(),
        collection_name=collection,
    )


def _rebuild_index_task(docs_dir: str, collection: str):
    from backend.app.rag.ingest import main as run_ingest
    start = time.time()
    try:
        chunks = run_ingest(docs_dir, collection)
        print(f"[index_rebuild] Done: {chunks} chunks in {(time.time()-start)*1000:.0f}ms")
    except Exception as e:
        print(f"[index_rebuild] Error: {e}")


@router.post("/index/rebuild", response_model=IndexRebuildResponse)
async def rebuild_index(background_tasks: BackgroundTasks):
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../docs"))
    collection = os.getenv("QDRANT_COLLECTION", "book_chunks")
    background_tasks.add_task(_rebuild_index_task, docs_dir, collection)
    return IndexRebuildResponse(status="rebuilding", chunks_indexed=0, duration_ms=0.0)
