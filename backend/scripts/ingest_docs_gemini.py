"""
Document Ingestion Script - Google Gemini Version (FREE!)
Works better on restricted networks
"""
import os
import sys
import asyncio
from pathlib import Path
from typing import List
import re

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
import google.generativeai as genai
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "ai_book_knowledge")
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Paths
DOCS_PATH = Path(__file__).parent.parent.parent / "docs"


def clean_markdown(text: str) -> str:
    """Remove frontmatter and clean markdown"""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2].strip()

    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()


def chunk_document(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split document into overlapping chunks"""
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        if end >= len(text):
            chunks.append(text[start:].strip())
            break

        chunk = text[start:end]
        last_para = chunk.rfind('\n\n')
        if last_para > chunk_size * 0.5:
            end = start + last_para
        else:
            last_period = chunk.rfind('. ')
            if last_period > chunk_size * 0.7:
                end = start + last_period + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


async def process_document(file_path: Path, docs_root: Path) -> List[PointStruct]:
    """Process a single markdown file"""
    print(f"Processing: {file_path.relative_to(docs_root)}")

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"  Error reading: {e}")
        return []

    content = clean_markdown(content)

    if len(content) < 100:
        print(f"  Skipped (too short)")
        return []

    chunks = chunk_document(content)
    print(f"  Created {len(chunks)} chunks")

    points = []
    for i, chunk in enumerate(chunks):
        try:
            # Generate embedding with Gemini
            result = genai.embed_content(
                model="models/embedding-001",
                content=chunk,
                task_type="retrieval_document"
            )
            embedding = result['embedding']

            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "text": chunk,
                    "source": str(file_path.relative_to(docs_root)),
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "file_name": file_path.name
                }
            )
            points.append(point)

        except Exception as e:
            print(f"  Error processing chunk {i}: {e}")
            continue

    return points


async def main():
    """Main ingestion function"""
    print("=" * 60)
    print("AI-Driven Development Book - Ingestion (Gemini)")
    print("=" * 60)

    # Validate configuration
    if not GOOGLE_API_KEY or GOOGLE_API_KEY == "get-from-https://aistudio.google.com/apikey":
        print("\n❌ ERROR: GOOGLE_API_KEY not set!")
        print("\nGet your FREE API key:")
        print("1. Visit: https://aistudio.google.com/apikey")
        print("2. Click 'Create API Key'")
        print("3. Copy the key")
        print("4. Add to backend/.env file:")
        print("   GOOGLE_API_KEY=your-key-here")
        return

    if not QDRANT_URL or not QDRANT_API_KEY:
        print("ERROR: QDRANT_URL or QDRANT_API_KEY not set")
        return

    if not DOCS_PATH.exists():
        print(f"ERROR: Docs path not found: {DOCS_PATH}")
        return

    # Configure Gemini
    genai.configure(api_key=GOOGLE_API_KEY)

    print(f"\n✅ Configuration:")
    print(f"  Docs Path: {DOCS_PATH}")
    print(f"  Collection: {QDRANT_COLLECTION}")
    print(f"  Embedding Model: Gemini embedding-001")

    # Test Gemini
    print("\n🧪 Testing Gemini API...")
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content="test",
            task_type="retrieval_document"
        )
        embedding_dim = len(result['embedding'])
        print(f"✅ Gemini working! Embedding dimension: {embedding_dim}")
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        print("\nPlease check your API key!")
        return

    # Initialize Qdrant
    print("\n📦 Initializing Qdrant...")
    qdrant_client = AsyncQdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )

    # Create collection
    print(f"\n🗄️  Setting up collection: {QDRANT_COLLECTION}")
    try:
        collections = await qdrant_client.get_collections()
        if any(c.name == QDRANT_COLLECTION for c in collections.collections):
            print("  Deleting existing collection...")
            await qdrant_client.delete_collection(collection_name=QDRANT_COLLECTION)

        await qdrant_client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=embedding_dim,
                distance=Distance.COSINE
            )
        )
        print("  ✅ Collection created!")
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return

    # Find markdown files
    print(f"\n📚 Scanning for markdown files...")
    md_files = list(DOCS_PATH.rglob("*.md")) + list(DOCS_PATH.rglob("*.mdx"))
    print(f"Found {len(md_files)} files")

    # Process documents
    print("\n⚙️  Processing documents...")
    all_points = []

    for file_path in md_files:
        points = await process_document(file_path, DOCS_PATH)
        all_points.extend(points)

    if not all_points:
        print("\n❌ ERROR: No points generated")
        return

    # Upload to Qdrant
    print(f"\n☁️  Uploading {len(all_points)} points to Qdrant...")
    try:
        await qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=all_points
        )
        print("✅ Upload complete!")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return

    # Verify
    print("\n✅ Verifying...")
    try:
        collection_info = await qdrant_client.get_collection(collection_name=QDRANT_COLLECTION)
        print(f"  Points in collection: {collection_info.points_count}")
    except Exception as e:
        print(f"  Error: {e}")

    await qdrant_client.close()

    print("\n" + "=" * 60)
    print("🎉 Ingestion complete!")
    print("=" * 60)
    print(f"\nTotal documents: {len(md_files)}")
    print(f"Total chunks: {len(all_points)}")
    print(f"\nYou can now start the server!")
    print("Run: uvicorn app.main:app --reload")


if __name__ == "__main__":
    asyncio.run(main())
