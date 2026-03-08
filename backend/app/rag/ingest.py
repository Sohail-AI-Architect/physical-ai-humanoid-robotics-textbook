#!/usr/bin/env python3
"""
Index all Docusaurus docs into Qdrant.

Usage (from repo root):
    python -m backend.app.rag.ingest
    python -m backend.app.rag.ingest --docs-dir docs --collection book_chunks
"""
import argparse
import os
import re
import sys
import hashlib
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env.local"))
load_dotenv()

from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.app.rag.embeddings import EmbeddingService
from backend.app.rag.qdrant_client import QdrantService

CHUNK_SIZE = 512
CHUNK_OVERLAP = 50


def extract_frontmatter(content: str) -> tuple[dict, str]:
    metadata: dict = {}
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            for line in parts[1].splitlines():
                if ":" in line:
                    key, _, val = line.partition(":")
                    metadata[key.strip()] = val.strip()
            return metadata, parts[2]
    return metadata, content


def file_to_url_fragment(docs_dir: Path, md_file: Path) -> str:
    rel = md_file.relative_to(docs_dir)
    parts = list(rel.parts)
    if parts[-1] in ("index.md", "index.mdx"):
        parts = parts[:-1]
    else:
        parts[-1] = parts[-1].replace(".md", "").replace(".mdx", "")
    return "/" + "/".join(parts) if parts else "/"


def chunk_id(doc_id: str, chunk_index: int) -> str:
    return hashlib.md5(f"{doc_id}::{chunk_index}".encode()).hexdigest()


def main(docs_dir: str, collection: str) -> int:
    docs_path = Path(docs_dir).resolve()
    if not docs_path.exists():
        print(f"ERROR: docs dir not found: {docs_path}", file=sys.stderr)
        return 0

    md_files = list(docs_path.rglob("*.md")) + list(docs_path.rglob("*.mdx"))
    print(f"Found {len(md_files)} markdown files in {docs_path}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )

    embedding_svc = EmbeddingService()
    qdrant_svc = QdrantService()
    qdrant_svc.ensure_collection(collection, vector_size=1024)

    total_chunks = 0
    for md_file in md_files:
        content = md_file.read_text(encoding="utf-8")
        meta, body = extract_frontmatter(content)
        chapter_title = meta.get("title", md_file.stem)
        url_fragment = file_to_url_fragment(docs_path, md_file)
        doc_id = str(md_file.relative_to(docs_path))

        chunks = splitter.split_text(body)
        if not chunks:
            continue

        print(f"  {doc_id}: {len(chunks)} chunks")
        embeddings = embedding_svc.embed_batch(chunks)

        batch = []
        for i, (text, emb) in enumerate(zip(chunks, embeddings)):
            section_match = re.search(r"^#{1,3} (.+)$", text, re.MULTILINE)
            section_title = section_match.group(1) if section_match else chapter_title
            batch.append({
                "id": chunk_id(doc_id, i),
                "embedding": emb,
                "doc_id": doc_id,
                "content": text,
                "chapter_title": chapter_title,
                "section_title": section_title,
                "url_fragment": url_fragment,
                "chunk_index": i,
            })

        qdrant_svc.upsert_chunks(batch)
        total_chunks += len(batch)

    print(f"\nDone. Indexed {total_chunks} chunks into '{collection}'.")
    return total_chunks


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Index docs into Qdrant")
    parser.add_argument(
        "--docs-dir",
        default=str(Path(__file__).resolve().parents[3] / "docs"),
        help="Path to docs directory (default: <repo_root>/docs)",
    )
    parser.add_argument(
        "--collection",
        default=os.getenv("QDRANT_COLLECTION", "book_chunks"),
    )
    args = parser.parse_args()
    result = main(args.docs_dir, args.collection)
    sys.exit(0 if result else 1)
