---
sidebar_position: 7
id: 03-rag-chatbots
slug: /chapters/03-rag-chatbots
title: "Chapter 7: Building RAG-Based Chatbots"
---

# Chapter 7: Building RAG-Based Chatbots

<div style={{textAlign: 'center', margin: '3rem 0'}}>
  <img src="/ai-driven-book/img/undraw-ai-chat.svg" alt="RAG Chatbots" style={{maxWidth: '460px', width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0, 102, 255, 0.15))'}} />
</div>

## What is RAG (Retrieval-Augmented Generation)?

RAG combines the power of large language models with external knowledge retrieval to create chatbots that can answer questions based on specific documents or data sources.

### The RAG Architecture

```
User Query → Embedding → Vector Search → Context Retrieval → LLM → Response
```

**Components:**

1. **Document Ingestion**: Convert documents to embeddings
2. **Vector Database**: Store and search embeddings efficiently
3. **Retrieval**: Find relevant context for queries
4. **Generation**: LLM generates answers using retrieved context
5. **Response**: Return formatted answer to user

import InteractiveDiagram, { Diagrams } from '@site/src/components/InteractiveDiagram';

<InteractiveDiagram
  title="RAG Architecture Flow"
  diagram={Diagrams.ragArchitecture}
  caption="Visual representation of how RAG systems process user queries through embedding, retrieval, and generation stages."
/>

<InteractiveDiagram
  title="RAG Workflow Sequence"
  diagram={Diagrams.ragWorkflow}
  caption="Step-by-step sequence showing the interaction between different components in a RAG system."
/>

## Why RAG?

### Advantages Over Fine-Tuning

- **No retraining** required for new information
- **Transparent sources** - know where answers come from
- **Easy updates** - just add new documents
- **Cost-effective** - no GPU training time
- **Reduced hallucinations** - grounded in actual documents

### Use Cases

- Customer support chatbots
- Documentation assistants
- Internal knowledge bases
- Research assistants
- Educational tutors
- Legal document analysis

## Vector Databases

### What Are Embeddings?

Embeddings are numerical representations of text that capture semantic meaning:

```python
# Text
"AI-driven development is transforming software engineering"

# Embedding (simplified)
[0.23, -0.45, 0.67, ..., 0.12]  # 1536 dimensions for OpenAI's text-embedding-3-small
```

Similar texts have similar embeddings, enabling semantic search.

### Popular Vector Databases

1. **Qdrant** - Fast, scalable, open-source
2. **Pinecone** - Managed service, easy setup
3. **Weaviate** - GraphQL interface
4. **Milvus** - Large-scale deployments
5. **ChromaDB** - Lightweight, embedded

### Qdrant Cloud Setup

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

# Connect to Qdrant Cloud
client = QdrantClient(
    url="https://your-cluster.qdrant.io",
    api_key="your-api-key"
)

# Create collection
client.create_collection(
    collection_name="book_knowledge",
    vectors_config=VectorParams(
        size=1536,  # OpenAI embedding dimension
        distance=Distance.COSINE
    )
)
```

## Document Processing Pipeline

### Step 1: Chunk Documents

Break large documents into smaller, semantically meaningful chunks:

```python
def chunk_document(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split document into overlapping chunks"""
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Try to break at sentence boundary
        if end < len(text):
            last_period = chunk.rfind('.')
            if last_period > chunk_size * 0.7:  # At least 70% of chunk size
                end = start + last_period + 1
                chunk = text[start:end]

        chunks.append(chunk.strip())
        start = end - overlap  # Overlap for context continuity

    return chunks
```

### Step 2: Generate Embeddings

```python
from openai import OpenAI

client = OpenAI(api_key="your-key")

def get_embedding(text: str) -> list[float]:
    """Get embedding for text"""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
```

### Step 3: Store in Vector Database

```python
from qdrant_client.models import PointStruct
import uuid

def ingest_document(document: str, metadata: dict):
    """Process and store document in Qdrant"""
    chunks = chunk_document(document)

    points = []
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)

        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "text": chunk,
                "chunk_index": i,
                **metadata
            }
        )
        points.append(point)

    client.upsert(
        collection_name="book_knowledge",
        points=points
    )
```

## Retrieval Strategy

### Basic Semantic Search

```python
def search_knowledge(query: str, top_k: int = 5) -> list[dict]:
    """Search for relevant context"""
    query_embedding = get_embedding(query)

    results = client.search(
        collection_name="book_knowledge",
        query_vector=query_embedding,
        limit=top_k
    )

    return [
        {
            "text": hit.payload["text"],
            "score": hit.score,
            "metadata": hit.payload
        }
        for hit in results
    ]
```

### Hybrid Search

Combine semantic search with keyword matching:

```python
def hybrid_search(query: str, top_k: int = 5) -> list[dict]:
    """Combine vector and keyword search"""
    query_embedding = get_embedding(query)

    results = client.search(
        collection_name="book_knowledge",
        query_vector=query_embedding,
        query_filter={
            "must": [
                {
                    "key": "text",
                    "match": {
                        "text": query
                    }
                }
            ]
        },
        limit=top_k
    )

    return [{"text": hit.payload["text"], "score": hit.score} for hit in results]
```

## OpenAI Agents SDK

### Creating a RAG Agent

```typescript
import { Agent } from '@openai/agents-sdk';
import { QdrantClient } from '@qdrant/js-client-rest';

const agent = new Agent({
  model: 'gpt-4o',
  instructions: `You are a helpful assistant that answers questions about
  AI-Driven Development. Use the provided context to answer questions accurately.
  If you don't know the answer based on the context, say so.`,
  tools: [
    {
      type: 'function',
      function: {
        name: 'search_knowledge',
        description: 'Search the knowledge base for relevant information',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query'
            }
          },
          required: ['query']
        }
      }
    }
  ]
});

// Handle tool calls
agent.on('tool_call', async (toolCall) => {
  if (toolCall.function.name === 'search_knowledge') {
    const { query } = JSON.parse(toolCall.function.arguments);
    const results = await searchKnowledge(query);

    return {
      tool_call_id: toolCall.id,
      output: JSON.stringify(results)
    };
  }
});
```

### Running the Agent

```typescript
const response = await agent.run({
  messages: [
    { role: 'user', content: 'What are the benefits of spec-driven development?' }
  ]
});

console.log(response.content);
```

## FastAPI Backend

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   └── documents.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embeddings.py
│   │   ├── qdrant.py
│   │   └── rag.py
│   └── config.py
├── requirements.txt
└── Dockerfile
```

### Main Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, documents
from app.config import settings

app = FastAPI(
    title="RAG Chatbot API",
    description="API for AI-Driven Development book chatbot",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.get("/")
async def root():
    return {"message": "RAG Chatbot API", "status": "running"}
```

### Chat Endpoint

```python
# app/routes/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag import RAGService

router = APIRouter()
rag_service = RAGService()

class ChatRequest(BaseModel):
    message: str
    context: str | None = None  # Optional selected text context
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    response: str
    sources: list[dict]
    conversation_id: str

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat message with RAG"""
    try:
        result = await rag_service.generate_response(
            query=request.message,
            context=request.context,
            conversation_id=request.conversation_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### RAG Service

```python
# app/services/rag.py
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from app.config import settings

class RAGService:
    def __init__(self):
        self.openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.qdrant = AsyncQdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY
        )

    async def generate_response(
        self,
        query: str,
        context: str | None = None,
        conversation_id: str | None = None
    ) -> dict:
        """Generate RAG response"""

        # If context provided, search within it
        if context:
            relevant_chunks = await self._search_in_context(query, context)
        else:
            # Search entire knowledge base
            relevant_chunks = await self._search_knowledge(query)

        # Build prompt with context
        context_text = "\n\n".join([
            f"[Source {i+1}]: {chunk['text']}"
            for i, chunk in enumerate(relevant_chunks)
        ])

        # Generate response
        response = await self.openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a helpful assistant for the AI-Driven
                    Development book. Answer questions based on the provided context.
                    Cite sources when appropriate.

                    Context:
                    {context_text}
                    """
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
        )

        return {
            "response": response.choices[0].message.content,
            "sources": [
                {
                    "text": chunk["text"][:200] + "...",
                    "score": chunk["score"]
                }
                for chunk in relevant_chunks
            ],
            "conversation_id": conversation_id or "new"
        }

    async def _search_knowledge(self, query: str, top_k: int = 5) -> list[dict]:
        """Search vector database"""
        query_embedding = await self._get_embedding(query)

        results = await self.qdrant.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=query_embedding,
            limit=top_k
        )

        return [
            {
                "text": hit.payload["text"],
                "score": hit.score
            }
            for hit in results
        ]

    async def _search_in_context(self, query: str, context: str) -> list[dict]:
        """Search within provided context"""
        # Chunk the context
        chunks = self._chunk_text(context)

        # Get embeddings for query and chunks
        query_embedding = await self._get_embedding(query)
        chunk_embeddings = [await self._get_embedding(chunk) for chunk in chunks]

        # Calculate similarity scores
        scores = [
            self._cosine_similarity(query_embedding, chunk_emb)
            for chunk_emb in chunk_embeddings
        ]

        # Return top chunks
        sorted_chunks = sorted(
            zip(chunks, scores),
            key=lambda x: x[1],
            reverse=True
        )[:3]

        return [
            {"text": chunk, "score": score}
            for chunk, score in sorted_chunks
        ]

    async def _get_embedding(self, text: str) -> list[float]:
        """Get text embedding"""
        response = await self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    def _chunk_text(self, text: str, size: int = 500) -> list[str]:
        """Split text into chunks"""
        words = text.split()
        chunks = []
        for i in range(0, len(words), size):
            chunk = " ".join(words[i:i + size])
            chunks.append(chunk)
        return chunks

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """Calculate cosine similarity"""
        import math
        dot_product = sum(x * y for x, y in zip(a, b))
        magnitude_a = math.sqrt(sum(x * x for x in a))
        magnitude_b = math.sqrt(sum(y * y for y in b))
        return dot_product / (magnitude_a * magnitude_b)
```

## Summary

In this chapter, you learned:

- RAG architecture and components
- Vector databases and embeddings
- Document processing pipelines
- OpenAI Agents SDK
- FastAPI backend implementation
- Context-aware search functionality

---

## 🎴 Test Your Knowledge

import Flashcards, { ChapterFlashcards } from '@site/src/components/Flashcards';

<Flashcards cards={ChapterFlashcards.ch3} title="Chapter 3: RAG Chatbots Flashcards" />

---

## 📝 Chapter Quiz

import MCQ, { ChapterMCQ } from '@site/src/components/MCQ';

<MCQ questions={ChapterMCQ.ch7} title="Chapter 7 Quiz" />

---

**Next Chapter:** We'll integrate the chatbot into the Docusaurus frontend and implement text selection features.
