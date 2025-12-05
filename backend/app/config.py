"""
Configuration management for the AI Book RAG Chatbot API
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    GOOGLE_API_KEY: str = Field(default="", description="Google Gemini API key (FREE!)")

    # Qdrant Configuration
    QDRANT_URL: str = Field(default="", description="Qdrant cluster URL")
    QDRANT_API_KEY: str = Field(default="", description="Qdrant API key")
    QDRANT_COLLECTION: str = Field(default="ai_book_knowledge", description="Qdrant collection name")

    # Application Configuration
    PORT: int = Field(default=8000, description="API server port")
    ENVIRONMENT: str = Field(default="development", description="Environment (development/production)")
    LOG_LEVEL: str = Field(default="info", description="Logging level")

    # CORS Configuration
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        description="Allowed CORS origins (comma-separated)"
    )

    # Model Configuration
    AI_PROVIDER: str = Field(default="ollama", description="AI provider (openai/gemini/ollama)")
    EMBEDDING_MODEL: str = Field(default="nomic-embed-text", description="Embedding model")
    CHAT_MODEL: str = Field(default="llama3.2", description="Chat model")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Ollama server URL")

    # RAG Configuration
    TOP_K_RESULTS: int = Field(default=5, description="Number of results to retrieve from vector DB")
    MIN_SCORE: float = Field(default=0.7, description="Minimum similarity score")
    CHUNK_SIZE: int = Field(default=1000, description="Document chunk size")
    CHUNK_OVERLAP: int = Field(default=200, description="Chunk overlap size")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
