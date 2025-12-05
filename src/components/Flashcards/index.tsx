import React, { useState } from 'react';
import styles from './styles.module.css';

export interface Flashcard {
  front: string;
  back: string;
  category?: string;
}

interface FlashcardsProps {
  cards: Flashcard[];
  title?: string;
}

export default function Flashcards({ cards, title = "Study Flashcards" }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [showStudyMode, setShowStudyMode] = useState(true);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const masteredCount = masteredCards.size;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(cards.length - 1); // Loop to end
    }
  };

  const handleMastered = () => {
    const newMastered = new Set(masteredCards);
    if (masteredCards.has(currentIndex)) {
      newMastered.delete(currentIndex);
    } else {
      newMastered.add(currentIndex);
    }
    setMasteredCards(newMastered);
  };

  const handleShuffle = () => {
    setCurrentIndex(Math.floor(Math.random() * cards.length));
    setIsFlipped(false);
  };

  const resetProgress = () => {
    setMasteredCards(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!showStudyMode) {
    return (
      <div className={styles.flashcardsContainer}>
        <div className={styles.header}>
          <h3>🎴 {title}</h3>
          <button onClick={() => setShowStudyMode(true)} className={styles.startBtn}>
            Start Studying ({cards.length} cards)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.flashcardsContainer}>
      <div className={styles.header}>
        <h3>🎴 {title}</h3>
        <button onClick={() => setShowStudyMode(false)} className={styles.closeBtn}>
          ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span className={styles.masteredInfo}>
            ✅ Mastered: {masteredCount}/{cards.length}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className={styles.cardWrapper} onClick={handleFlip}>
        <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
          <div className={styles.cardFront}>
            <div className={styles.cardLabel}>Question</div>
            <div className={styles.cardContent}>{currentCard.front}</div>
            <div className={styles.flipHint}>Click to flip →</div>
          </div>
          <div className={styles.cardBack}>
            <div className={styles.cardLabel}>Answer</div>
            <div className={styles.cardContent}>{currentCard.back}</div>
            <div className={styles.flipHint}>← Click to flip back</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button onClick={handlePrevious} className={styles.navBtn} title="Previous card">
          ← Previous
        </button>

        <button
          onClick={handleMastered}
          className={`${styles.masteredBtn} ${masteredCards.has(currentIndex) ? styles.mastered : ''}`}
          title="Mark as mastered"
        >
          {masteredCards.has(currentIndex) ? '✅ Mastered' : '⭕ Mark Mastered'}
        </button>

        <button onClick={handleNext} className={styles.navBtn} title="Next card">
          Next →
        </button>
      </div>

      {/* Additional Controls */}
      <div className={styles.additionalControls}>
        <button onClick={handleShuffle} className={styles.shuffleBtn}>
          🔀 Shuffle
        </button>
        <button onClick={resetProgress} className={styles.resetBtn}>
          🔄 Reset Progress
        </button>
      </div>

      {/* All Cards Preview */}
      <div className={styles.cardsGrid}>
        {cards.map((card, idx) => (
          <button
            key={idx}
            className={`${styles.cardPreview} ${idx === currentIndex ? styles.active : ''} ${masteredCards.has(idx) ? styles.masteredPreview : ''}`}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            title={card.front}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// Pre-made flashcard sets for each chapter
export const ChapterFlashcards = {
  preface: [
    { front: "What is AI-Driven Development?", back: "A development approach that leverages AI tools to assist in coding, testing, and architecture decisions, enhancing developer productivity and code quality." },
    { front: "What are the main benefits of AI-Driven Development?", back: "Faster development, improved code quality, automated testing, better documentation, and enhanced problem-solving capabilities." },
    { front: "What skills are essential for AI-Driven Development?", back: "Prompt engineering, understanding AI limitations, code review skills, and the ability to guide AI tools effectively." },
    { front: "How has AI changed software development?", back: "AI has transformed development from pure manual coding to collaborative work with AI assistants, enabling faster prototyping, better code suggestions, and automated documentation." },
    { front: "What's the difference between AI-assisted and traditional coding?", back: "Traditional coding relies solely on human expertise, while AI-assisted coding uses AI suggestions, completions, and generation to accelerate development while maintaining human oversight." },
    { front: "Why is human oversight still critical with AI?", back: "AI can hallucinate, produce insecure code, miss business context, and make logical errors. Human developers must review, validate, and refine AI outputs." },
    { front: "What is the AI-Native Era?", back: "The current shift where AI is integrated into every aspect of software development, from design to deployment, fundamentally changing how we build software." }
  ],

  ch1: [
    { front: "What is the foundation of AI-Driven Development?", back: "Understanding how to effectively collaborate with AI assistants, providing clear context, and iteratively refining outputs." },
    { front: "How do AI coding assistants work?", back: "They use large language models trained on code to understand context and generate relevant code suggestions, completions, and explanations." },
    { front: "What are the limitations of AI assistants?", back: "They can hallucinate, produce outdated code, lack understanding of business context, and require human oversight." },
    { front: "What is a Large Language Model (LLM)?", back: "An AI model trained on massive amounts of text data to understand and generate human-like text, including code." },
    { front: "How do you provide good context to AI?", back: "Include relevant code, clear requirements, examples, constraints, and business logic in your prompts." },
    { front: "What is the iterative refinement process?", back: "Generate initial output → Review → Provide feedback → Regenerate → Repeat until satisfactory." },
    { front: "Why is code review still essential with AI?", back: "AI can introduce bugs, security vulnerabilities, performance issues, or logical errors that humans must catch." },
    { front: "What makes a good AI coding prompt?", back: "Clear objective, relevant context, specific requirements, examples, and expected output format." }
  ],

  ch2: [
    { front: "What is Spec-Driven Development?", back: "A methodology where clear specifications are created before implementation, ensuring alignment between requirements and code." },
    { front: "Why is Spec-Driven Development important with AI?", back: "AI tools work better with clear specifications, producing more accurate code and reducing iterations." },
    { front: "What makes a good specification?", back: "Clear requirements, measurable outcomes, edge cases defined, and acceptance criteria specified." },
    { front: "What are the key elements of a spec?", back: "Goals, requirements, constraints, acceptance criteria, edge cases, and examples." },
    { front: "How detailed should specs be?", back: "Detailed enough to be unambiguous but flexible enough to allow for implementation choices." },
    { front: "When should you write specs?", back: "Before starting implementation, after gathering requirements and understanding the problem." },
    { front: "How do specs improve AI code generation?", back: "They provide clear context, reduce ambiguity, and help AI understand expected behavior." },
    { front: "What's the difference between specs and documentation?", back: "Specs are written before implementation (prescriptive), documentation is written after (descriptive)." }
  ],

  ch3: [
    { front: "What is RAG?", back: "Retrieval-Augmented Generation - a technique that combines vector search with LLM generation to provide accurate, context-aware responses based on specific documents." },
    { front: "What are the main components of a RAG system?", back: "Document ingestion, embedding generation, vector database, retrieval system, and LLM generation." },
    { front: "Why use RAG instead of fine-tuning?", back: "RAG is more cost-effective, easier to update, doesn't require model retraining, and can cite sources." },
    { front: "What is document chunking?", back: "Breaking large documents into smaller, semantically meaningful pieces for better retrieval and processing." },
    { front: "What's the ideal chunk size?", back: "Typically 500-1500 characters, balancing context richness with search precision." },
    { front: "What is chunk overlap?", back: "Overlapping text between adjacent chunks to maintain context continuity across boundaries." },
    { front: "How do you measure retrieval quality?", back: "Using metrics like precision, recall, MRR (Mean Reciprocal Rank), and NDCG (Normalized Discounted Cumulative Gain)." },
    { front: "What is semantic search?", back: "Search based on meaning rather than exact keyword matches, using vector similarity." },
    { front: "What's the difference between RAG and traditional search?", back: "RAG generates natural language answers using retrieved context; traditional search returns matching documents." },
    { front: "What is context window in RAG?", back: "The maximum amount of text (in tokens) that can be passed to the LLM for generation." }
  ],

  ch4: [
    { front: "What are vector embeddings?", back: "Numerical representations of text that capture semantic meaning, enabling similarity search and semantic retrieval." },
    { front: "What is a vector database?", back: "A specialized database optimized for storing and searching vector embeddings using similarity metrics." },
    { front: "How does semantic search work?", back: "Convert query to embedding, find similar embeddings in vector database, retrieve associated documents." },
    { front: "What is cosine similarity?", back: "A metric measuring the cosine of the angle between two vectors, used to determine similarity (ranges from -1 to 1)." },
    { front: "What's the difference between cosine and euclidean distance?", back: "Cosine measures angle (direction), euclidean measures absolute distance. Cosine is better for high-dimensional text embeddings." },
    { front: "What are popular embedding models?", back: "OpenAI text-embedding-3-small/large, Google PaLM, Cohere, Sentence Transformers." },
    { front: "What is embedding dimensionality?", back: "The number of features in the vector representation (e.g., 1536 for OpenAI, 768 for BERT)." },
    { front: "Why normalize embeddings?", back: "Normalization makes cosine similarity equivalent to dot product, improving search speed and consistency." }
  ],

  ch5: [
    { front: "What is the AI-Driven Development workflow?", back: "Define requirements → Generate spec → AI generates code → Review & refine → Test → Deploy." },
    { front: "How do you effectively prompt AI for code?", back: "Provide context, specify requirements clearly, give examples, define constraints, and iterate." },
    { front: "What's the role of testing in AI-Driven Development?", back: "Validate AI-generated code, ensure edge cases are covered, and maintain code quality standards." },
    { front: "What is pair programming with AI?", back: "Collaborative coding where AI suggests code while developer guides, reviews, and refines in real-time." },
    { front: "How do you handle AI mistakes?", back: "Review code carefully, test thoroughly, provide corrective feedback, and regenerate with better prompts." },
    { front: "What are AI code review best practices?", back: "Check logic, security, performance, edge cases, and alignment with requirements." },
    { front: "When should you NOT use AI for coding?", back: "Security-critical code, complex algorithms requiring deep domain expertise, or when learning fundamentals." }
  ],

  ch6: [
    { front: "What are popular AI coding tools?", back: "GitHub Copilot, ChatGPT, Claude, Cursor, Tabnine, and specialized domain tools." },
    { front: "How to choose the right AI tool?", back: "Consider use case, programming language support, integration needs, cost, and privacy requirements." },
    { front: "What's the future of AI development tools?", back: "More sophisticated code generation, better context understanding, specialized domain models, and improved debugging." },
    { front: "What is GitHub Copilot?", back: "AI pair programmer that suggests code completions and entire functions based on context and comments." },
    { front: "What makes Claude different from ChatGPT?", back: "Claude has longer context windows, better instruction following, and is trained with Constitutional AI for safety." },
    { front: "What is Cursor IDE?", back: "An AI-first code editor built on VS Code with deep AI integration for code generation and editing." },
    { front: "How do AI tools handle privacy?", back: "Varies by tool - some train on your code (opt-out required), others keep it private. Check policies carefully." }
  ],

  ch7: [
    { front: "What is Markdown Prompting?", back: "Using markdown-formatted prompts to provide structured, clear instructions to AI models for better results." },
    { front: "Why use markdown for prompts?", back: "Better structure, clearer hierarchy, easier to read, and helps AI understand context and requirements." },
    { front: "What are markdown prompting best practices?", back: "Use headers for sections, lists for requirements, code blocks for examples, and clear formatting for emphasis." },
    { front: "How do headers improve prompts?", back: "They create clear sections, establish hierarchy, and help AI understand the structure of your request." },
    { front: "When should you use code blocks?", back: "For examples, expected output format, error messages, or any literal text that needs exact formatting." },
    { front: "What are prompt templates?", back: "Reusable structured prompts with placeholders for variables, ensuring consistency across similar tasks." },
    { front: "How do bullet points help AI?", back: "They break down complex requirements into clear, discrete items that AI can address individually." }
  ],

  ch8: [
    { front: "What are SDD Fundamentals?", back: "Spec-Driven Development fundamentals include clear requirements, testable criteria, iterative refinement, and validation." },
    { front: "How to write effective specs for AI?", back: "Be specific, provide examples, define edge cases, specify output format, and include acceptance criteria." },
    { front: "What's the relationship between specs and code quality?", back: "Better specs lead to more accurate AI-generated code, fewer iterations, and higher quality output." },
    { front: "What is acceptance-driven development?", back: "Writing acceptance criteria before implementation to define what 'done' means." },
    { front: "How do you validate AI-generated code against specs?", back: "Compare output to acceptance criteria, run tests, verify edge cases, and check business logic." },
    { front: "What makes specs testable?", back: "Measurable criteria, specific expected behaviors, clear inputs and outputs, and objective success metrics." },
    { front: "How often should specs be updated?", back: "When requirements change, after discovering edge cases, or when clarifying ambiguities during implementation." }
  ]
};
