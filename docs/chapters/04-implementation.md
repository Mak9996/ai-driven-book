---
sidebar_position: 8
id: implementation
slug: /chapters/implementation
title: "Chapter 8: Implementation Guide"
---

# Chapter 8: Implementation Guide

import InteractiveDiagram from '@site/src/components/InteractiveDiagram';

<div style={{textAlign: 'center', margin: '3rem 0'}}>
  <img src="/ai-driven-book/img/rocket-launch.svg" alt="Implementation Guide" style={{maxWidth: '450px', width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0, 102, 255, 0.15))'}} />
</div>

## Setting Up Your Development Environment

### Required Tools

```bash
# Node.js and npm
node --version  # v20+
npm --version   # v10+

# Python
python --version  # v3.9+
pip --version

# Git
git --version

# Docker (optional)
docker --version
```

### API Keys Setup

Create a `.env` file:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant Cloud
QDRANT_URL=https://xxxxx.qdrant.io
QDRANT_API_KEY=...
QDRANT_COLLECTION=book_knowledge

# Application
PORT=8000
ENVIRONMENT=development
```

## Building the Complete System

### Project Structure

```
ai-driven-book/
├── frontend/              # Docusaurus site
│   ├── docs/
│   ├── src/
│   ├── static/
│   └── docusaurus.config.ts
├── backend/               # FastAPI server
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── scripts/               # Utility scripts
│   └── ingest_docs.py
└── docker-compose.yml
```

### Backend Implementation

#### Dependencies

```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
openai==1.3.0
qdrant-client==1.7.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-dotenv==1.0.0
```

#### Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION: str = "book_knowledge"

    # Application
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

#### Document Ingestion Script

```python
# scripts/ingest_docs.py
import os
import asyncio
from pathlib import Path
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import AsyncOpenAI
import uuid

async def ingest_docusaurus_docs():
    """Ingest all Docusaurus markdown files"""

    # Initialize clients
    openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    qdrant = AsyncQdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY")
    )

    collection_name = "book_knowledge"

    # Create collection
    try:
        await qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=1536,
                distance=Distance.COSINE
            )
        )
        print(f"Created collection: {collection_name}")
    except Exception as e:
        print(f"Collection exists or error: {e}")

    # Find all markdown files
    docs_path = Path("../frontend/docs")
    md_files = list(docs_path.rglob("*.md")) + list(docs_path.rglob("*.mdx"))

    print(f"Found {len(md_files)} markdown files")

    points = []

    for md_file in md_files:
        print(f"Processing {md_file}...")

        # Read content
        content = md_file.read_text(encoding="utf-8")

        # Remove frontmatter
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                content = parts[2].strip()

        # Chunk document
        chunks = chunk_document(content)

        # Create embeddings
        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) < 50:  # Skip very small chunks
                continue

            # Get embedding
            response = await openai.embeddings.create(
                model="text-embedding-3-small",
                input=chunk
            )
            embedding = response.data[0].embedding

            # Create point
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "text": chunk,
                    "source": str(md_file.relative_to(docs_path)),
                    "chunk_index": i,
                    "file_path": str(md_file)
                }
            )
            points.append(point)

        print(f"  Created {len(chunks)} chunks")

    # Upload to Qdrant
    print(f"\nUploading {len(points)} points to Qdrant...")
    await qdrant.upsert(
        collection_name=collection_name,
        points=points
    )

    print("Ingestion complete!")

def chunk_document(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split document into overlapping chunks"""
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Try to break at paragraph or sentence
        if end < len(text):
            # Look for paragraph break
            last_para = chunk.rfind('\n\n')
            if last_para > chunk_size * 0.5:
                end = start + last_para
            else:
                # Look for sentence break
                last_period = chunk.rfind('.')
                if last_period > chunk_size * 0.7:
                    end = start + last_period + 1

            chunk = text[start:end]

        if chunk.strip():
            chunks.append(chunk.strip())

        start = end - overlap

    return chunks

if __name__ == "__main__":
    asyncio.run(ingest_docusaurus_docs())
```

### Frontend Implementation

#### Install ChatKit

```bash
cd frontend
npm install @openai/chatkit
```

#### Create Chatbot Component

```typescript
// src/components/Chatbot/index.tsx
import React, { useState } from 'react';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ text: string; score: number }>;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Listen for text selection
  React.useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 10) {
        setSelectedText(text);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: selectedText || null
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSelectedText(''); // Clear selection after use
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatbot}>
      {selectedText && (
        <div className={styles.contextBanner}>
          Context selected: "{selectedText.substring(0, 50)}..."
          <button onClick={() => setSelectedText('')}>Clear</button>
        </div>
      )}

      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={styles[msg.role]}>
            <div className={styles.content}>{msg.content}</div>
            {msg.sources && msg.sources.length > 0 && (
              <div className={styles.sources}>
                <strong>Sources:</strong>
                {msg.sources.map((source, i) => (
                  <div key={i} className={styles.source}>
                    {source.text} (relevance: {(source.score * 100).toFixed(1)}%)
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Thinking...</div>}
      </div>

      <div className={styles.input}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder={
            selectedText
              ? "Ask about the selected text..."
              : "Ask a question about the book..."
          }
        />
        <button onClick={sendMessage} disabled={!input.trim() || isLoading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

#### Styles

```css
/* src/components/Chatbot/styles.module.css */
.chatbot {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.contextBanner {
  background: #e3f2fd;
  padding: 10px;
  font-size: 12px;
  border-bottom: 1px solid #90caf9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contextBanner button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.user, .assistant {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
}

.user {
  background: #e3f2fd;
  margin-left: 40px;
}

.assistant {
  background: #f5f5f5;
  margin-right: 40px;
}

.content {
  margin-bottom: 8px;
}

.sources {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.source {
  margin-top: 4px;
  padding: 4px;
  background: white;
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}

.input {
  display: flex;
  padding: 16px;
  border-top: 1px solid #eee;
}

.input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
}

.input button {
  padding: 10px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

#### Integrate into Docusaurus

```typescript
// src/theme/Root.tsx
import React from 'react';
import Chatbot from '../components/Chatbot';

export default function Root({ children }) {
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
}
```

### Docker Deployment

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    environment:
      - PORT=8000
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
```

## Testing the System

### Test Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for API documentation.

### Test Frontend

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`

### Test Chatbot

1. Select some text on the page
2. Ask a question in the chatbot
3. Verify it uses the selected context
4. Try asking without selection
5. Check source citations

## Optimization Tips

### Performance

1. **Cache embeddings** - Don't regenerate for same text
2. **Batch processing** - Process multiple documents at once
3. **Async operations** - Use async/await throughout
4. **Connection pooling** - Reuse database connections

### Accuracy

1. **Chunk size tuning** - Experiment with 500-2000 characters
2. **Overlap adjustment** - 10-20% overlap prevents context loss
3. **Retrieval tuning** - Adjust top_k based on query complexity
4. **Prompt engineering** - Refine system prompts for better responses

### Cost

1. **Use smaller models** - text-embedding-3-small is cheaper
2. **Cache responses** - Store common queries
3. **Optimize chunk count** - Fewer chunks = lower storage costs
4. **Rate limiting** - Prevent abuse

## Summary

In this chapter, you implemented:

- Complete FastAPI backend with RAG
- Document ingestion pipeline
- Docusaurus chatbot integration
- Text selection context feature
- Docker deployment configuration

**Next Chapter:** Advanced topics including multi-agent systems and custom Claude Code skills.


---



## 🛠️ Implementation Workflow

<InteractiveDiagram
  title="AI-Assisted Implementation Process"
  diagram={`graph TD
    Spec[📋 Specification] --> Prompt[✍️ Craft Prompt]
    Prompt --> AI[🤖 AI Generation]
    AI --> Code[💻 Generated Code]
    Code --> Review{👀 Review}

    Review -->|Issues| Refine[🔧 Refine Prompt]
    Refine --> AI

    Review -->|Good| Test[✅ Write Tests]
    Test --> Run{🧪 Tests Pass?}

    Run -->|Fail| Debug[🐛 Debug]
    Debug --> AI

    Run -->|Pass| Deploy[🚀 Deploy]

    style Spec fill:#ff4757,stroke:#2f3542,stroke-width:3px
    style Prompt fill:#ffa502,stroke:#2f3542,stroke-width:3px
    style AI fill:#ffd700,stroke:#2f3542,stroke-width:3px
    style Code fill:#00d2d3,stroke:#2f3542,stroke-width:3px
    style Review fill:#5352ed,stroke:#2f3542,stroke-width:3px
    style Refine fill:#ff6348,stroke:#2f3542,stroke-width:3px
    style Test fill:#2ed573,stroke:#2f3542,stroke-width:3px
    style Run fill:#1e90ff,stroke:#2f3542,stroke-width:3px
    style Debug fill:#ff7675,stroke:#2f3542,stroke-width:3px
    style Deploy fill:#00b894,stroke:#2f3542,stroke-width:3px`}
  caption="Step-by-step implementation process with AI assistance."
/>

\n## 🎴 Test Your Knowledge

import Flashcards, { ChapterFlashcards } from '@site/src/components/Flashcards';

<Flashcards cards={ChapterFlashcards.ch4} title="Chapter Flashcards" />

---

## 📝 Chapter Quiz

import MCQ, { ChapterMCQ } from '@site/src/components/MCQ';

<MCQ questions={ChapterMCQ.ch8} title="Chapter 8 Quiz" />

---
