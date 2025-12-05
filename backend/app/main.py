"""
FastAPI RAG Chatbot for AI-Driven Development Book
Powered by Google Gemini (FREE!) + OpenAI
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging

import google.generativeai as genai
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from app.config import settings

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL.upper())
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="AI Book RAG Chatbot API",
    description="RAG-powered chatbot with Google Gemini (FREE!)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

# Initialize Qdrant
qdrant_client = AsyncQdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY
) if settings.QDRANT_URL and settings.QDRANT_API_KEY else None


# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    conversation_history: Optional[List[dict]] = None


class SimpleChatRequest(BaseModel):
    """Simple chat without RAG - works with user's API key"""
    message: str
    provider: str  # 'openai' or 'gemini'
    api_key: str
    model: Optional[str] = None
    context: Optional[str] = None


class SimpleChatResponse(BaseModel):
    response: str
    tokens_used: Optional[int] = None


class Source(BaseModel):
    text: str
    source: str
    score: float


class ChatResponse(BaseModel):
    response: str
    sources: List[Source]
    tokens_used: Optional[int] = None


class HealthResponse(BaseModel):
    status: str
    vector_db_connected: bool
    ai_provider: str


# Helper Functions
async def get_embedding(text: str) -> List[float]:
    """Generate embedding using Gemini"""
    try:
        result = genai.embed_content(
            model=settings.EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_query"
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Gemini embedding error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")


async def search_knowledge_base(query: str, top_k: int = None) -> List[dict]:
    """Search vector database for relevant content"""
    if not qdrant_client:
        raise HTTPException(status_code=500, detail="Qdrant client not configured")

    top_k = top_k or settings.TOP_K_RESULTS

    try:
        # Generate query embedding
        query_vector = await get_embedding(query)

        # Search Qdrant
        results = await qdrant_client.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=query_vector,
            limit=top_k,
            score_threshold=settings.MIN_SCORE
        )

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "text": result.payload.get("text", ""),
                "source": result.payload.get("source", "unknown"),
                "score": result.score
            })

        return formatted_results
    except Exception as e:
        logger.error(f"Error searching knowledge base: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


async def generate_response(query: str, context: str, user_context: Optional[str] = None) -> tuple[str, int]:
    """Generate response using Gemini"""
    # Build prompt
    system_prompt = """You are an expert AI assistant for the "AI-Driven Development" book.
Your role is to help readers understand AI-driven development, spec-driven methodologies,
RAG systems, and related topics covered in the book.

Use the provided context from the book to answer questions accurately.
If the context doesn't contain the answer, say so honestly.
Be concise but thorough."""

    full_prompt = f"""{system_prompt}

Context from the book:
{context}
"""

    if user_context:
        full_prompt += f"\nUser selected text:\n{user_context}\n"

    full_prompt += f"\nQuestion: {query}\n\nAnswer:"

    try:
        model = genai.GenerativeModel(settings.CHAT_MODEL)
        response = model.generate_content(full_prompt)

        return response.text, 0  # Gemini doesn't provide token count
    except Exception as e:
        logger.error(f"Gemini generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")


# API Endpoints
@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "AI Book RAG Chatbot API (Powered by Gemini)",
        "version": "1.0.0",
        "provider": "Google Gemini",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    vector_db_connected = False

    if qdrant_client:
        try:
            collections = await qdrant_client.get_collections()
            vector_db_connected = any(
                c.name == settings.QDRANT_COLLECTION
                for c in collections.collections
            )
        except Exception as e:
            logger.error(f"Qdrant connection error: {e}")

    return HealthResponse(
        status="healthy" if vector_db_connected else "degraded",
        vector_db_connected=vector_db_connected,
        ai_provider="Google Gemini"
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint with RAG

    Searches the book content and generates AI-powered responses
    """
    try:
        # Search knowledge base
        logger.info(f"Searching for: {request.message}")
        search_results = await search_knowledge_base(request.message)

        if not search_results:
            return ChatResponse(
                response="I couldn't find relevant information in the book for that question. Could you rephrase or ask about topics covered in the AI-Driven Development book?",
                sources=[],
                tokens_used=0
            )

        # Combine context
        context = "\n\n".join([r["text"] for r in search_results[:3]])

        # Generate response
        logger.info("Generating response with Gemini")
        answer, tokens = await generate_response(
            request.message,
            context,
            request.context
        )

        # Format sources
        sources = [
            Source(
                text=r["text"][:200] + "..." if len(r["text"]) > 200 else r["text"],
                source=r["source"],
                score=r["score"]
            )
            for r in search_results
        ]

        return ChatResponse(
            response=answer,
            sources=sources,
            tokens_used=tokens
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search", response_model=List[Source])
async def search(query: str, top_k: int = 5):
    """
    Search endpoint (without AI generation)

    Returns raw search results from vector database
    """
    try:
        results = await search_knowledge_base(query, top_k)
        return [
            Source(
                text=r["text"],
                source=r["source"],
                score=r["score"]
            )
            for r in results
        ]
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simple-chat", response_model=SimpleChatResponse)
async def simple_chat(request: SimpleChatRequest):
    """
    Simple chat endpoint - No RAG required

    Works directly with user's API key (OpenAI or Gemini)
    Perfect for quick questions without vector database setup
    """
    try:
        logger.info(f"Simple chat request using {request.provider}")

        # Build system prompt
        system_content = """You are an expert AI assistant for the "AI-Driven Development" book.
Provide clear, accurate answers about AI-driven development, spec-driven methodologies,
RAG systems, and related topics. Be concise but thorough."""

        # Add context if provided
        user_message = request.message
        if request.context:
            user_message = f"Context: {request.context}\n\nQuestion: {request.message}"

        # Call appropriate provider
        if request.provider == 'openai':
            # Initialize OpenAI client with user's API key
            client = AsyncOpenAI(api_key=request.api_key)
            model = request.model or 'gpt-4o'

            try:
                response = await client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": user_message}
                    ],
                    temperature=0.7,
                    max_tokens=2000
                )

                return SimpleChatResponse(
                    response=response.choices[0].message.content,
                    tokens_used=response.usage.total_tokens if response.usage else None
                )
            except Exception as e:
                logger.error(f"OpenAI error: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"OpenAI API error: {str(e)}"
                )

        elif request.provider == 'gemini':
            # Configure Gemini with user's API key
            genai.configure(api_key=request.api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Combine system and user messages for Gemini
            full_prompt = f"{system_content}\n\n{user_message}"

            try:
                response = model.generate_content(full_prompt)
                return SimpleChatResponse(
                    response=response.text,
                    tokens_used=None  # Gemini doesn't provide token count
                )
            except Exception as e:
                logger.error(f"Gemini error: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Gemini API error: {str(e)}"
                )

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported provider: {request.provider}. Use 'openai' or 'gemini'"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in simple_chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("Starting AI Book RAG Chatbot API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"AI Provider: Google Gemini")
    logger.info(f"Chat Model: {settings.CHAT_MODEL}")
    logger.info(f"Embedding Model: {settings.EMBEDDING_MODEL}")
    logger.info("Using FREE Gemini API!")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("Shutting down")
    if qdrant_client:
        await qdrant_client.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
