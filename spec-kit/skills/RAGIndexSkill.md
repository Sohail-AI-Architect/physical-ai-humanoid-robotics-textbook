# RAGIndexSkill

## Purpose
Manages the RAG chatbot's vector index — rebuilds the Qdrant collection from Docusaurus docs, validates chunk quality, and reports indexing statistics.

## Trigger
Invoked via `/index-rebuild` or when chapter content changes and the vector index needs updating.

## Steps

### 1. Validate Prerequisites
```bash
# Check Qdrant and Cohere connectivity
python3 -c "
import os, sys
sys.path.insert(0, '.')
from backend.app.rag.qdrant_client import QdrantService
from backend.app.rag.embeddings import EmbeddingService
qs = QdrantService()
es = EmbeddingService()
print(f'Qdrant: {qs.count_chunks()} existing chunks')
vec = es.embed_text('test')
print(f'Cohere: embedding dim = {len(vec)}')
"
```

### 2. Run Ingest
```bash
python -m backend.app.rag.ingest --docs-dir docs --collection book_chunks
```

### 3. Validate Results
```bash
# Check chunk count matches expected range
python3 -c "
import sys; sys.path.insert(0, '.')
from backend.app.rag.qdrant_client import QdrantService
qs = QdrantService()
count = qs.count_chunks()
print(f'Total chunks: {count}')
assert count > 50, f'Too few chunks ({count}), expected >50'
print('VALIDATION PASSED')
"
```

### 4. Test Query
```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is ROS 2?", "scope": "global"}' | python3 -m json.tool
```

## Outputs
- Number of markdown files processed
- Total chunks indexed
- Embedding dimensions confirmed (1024 for Cohere)
- Sample query result to verify retrieval works

## Configuration
- **Chunk size**: 512 tokens
- **Chunk overlap**: 50 tokens
- **Embedding model**: Cohere `embed-english-v3.0` (1024-dim)
- **Vector DB**: Qdrant Cloud Free Tier, collection `book_chunks`, cosine similarity
- **Docs directory**: `docs/` at repo root

## Error Handling
- If Qdrant unreachable: check QDRANT_URL and QDRANT_API_KEY in .env.local
- If Cohere 401: check COHERE_API_KEY in .env.local
- If 0 chunks indexed: verify docs/ directory contains .md/.mdx files
