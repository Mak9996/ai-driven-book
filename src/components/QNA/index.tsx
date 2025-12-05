import React, { useState } from 'react';
import styles from './styles.module.css';

interface QNAItem {
  question: string;
  answer: string;
}

interface QNAProps {
  questions: QNAItem[];
  title?: string;
}

export default function QNA({ questions, title = "Chapter Q&A" }: QNAProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.qnaContainer}>
      <div className={styles.header}>
        <h3>❓ {title}</h3>
        <p className={styles.subtitle}>Test your understanding with these questions</p>
      </div>

      <div className={styles.qnaList}>
        {questions.map((item, index) => (
          <div
            key={index}
            className={`${styles.qnaItem} ${openIndex === index ? styles.open : ''}`}
          >
            <button
              className={styles.questionButton}
              onClick={() => toggleQuestion(index)}
              aria-expanded={openIndex === index}
            >
              <span className={styles.questionNumber}>Q{index + 1}</span>
              <span className={styles.questionText}>{item.question}</span>
              <span className={styles.icon}>
                {openIndex === index ? '▲' : '▼'}
              </span>
            </button>

            {openIndex === index && (
              <div className={styles.answer}>
                <div className={styles.answerLabel}>Answer:</div>
                <div className={styles.answerText}>{item.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Chapter-specific Q&A data
export const ChapterQNA = {
  ch1: [
    {
      question: "What are the key components of a Large Language Model (LLM)?",
      answer: "LLMs consist of: 1) Tokenization layer that breaks text into tokens, 2) Embedding layer that converts tokens to vectors, 3) Transformer layers with self-attention mechanisms, 4) Output layer for prediction. They use billions of parameters trained on vast text datasets to understand and generate human-like text."
    },
    {
      question: "How do tokens and context windows affect LLM performance?",
      answer: "Tokens are the basic units LLMs process (words, subwords, or characters). Context windows limit how much text an LLM can consider at once. Larger context windows allow better understanding of long documents but cost more. Managing context efficiently is crucial for AI-driven development."
    },
    {
      question: "What is the difference between fine-tuning and prompt engineering?",
      answer: "Fine-tuning involves retraining an LLM on specific data to specialize it for certain tasks, requiring significant compute and data. Prompt engineering crafts effective instructions to guide the model's responses without retraining, making it faster and more accessible for developers."
    },
    {
      question: "Why is AI-driven development important for modern software engineering?",
      answer: "AI-driven development accelerates coding, automates repetitive tasks, assists with debugging, generates tests, and provides intelligent code suggestions. It allows developers to focus on high-level design and problem-solving while AI handles implementation details, dramatically improving productivity."
    }
  ],

  ch2: [
    {
      question: "What is AI-Driven Development and how does it differ from traditional development?",
      answer: "AI-Driven Development uses AI tools to assist in coding, architecture decisions, testing, and debugging. Unlike traditional development where humans write all code manually, AI-driven development leverages AI as a pair programmer, generating code from specifications, suggesting improvements, and automating routine tasks."
    },
    {
      question: "What are the main benefits of using AI assistants in development workflows?",
      answer: "Key benefits include: 1) Faster code generation from natural language descriptions, 2) Automated testing and bug detection, 3) Code review and refactoring suggestions, 4) Documentation generation, 5) Learning assistance for new technologies, 6) Reduced context switching and improved focus on problem-solving."
    },
    {
      question: "What are common pitfalls when using AI coding assistants?",
      answer: "Common pitfalls include: over-relying on AI without understanding the code, accepting generated code without review, security vulnerabilities in AI-generated code, hallucinated functions or APIs, inconsistent code style, and treating AI as infallible. Always review, test, and validate AI-generated code."
    },
    {
      question: "How can developers effectively integrate AI tools into their workflow?",
      answer: "Effective integration involves: using AI for initial code drafts and boilerplate, iterative refinement with clear prompts, code review of AI suggestions, combining AI with existing tools (linters, tests), maintaining human oversight for critical decisions, and continuous learning to improve prompt engineering skills."
    }
  ],

  ch3: [
    {
      question: "What are the main AI development tools available today?",
      answer: "Main categories include: 1) IDE-integrated tools (GitHub Copilot, Cursor, Tabnine) for inline code completion, 2) Chat-based assistants (ChatGPT, Claude, Gemini) for conversational coding help, 3) CLI tools (Claude Code, Aider) for terminal-based workflows, 4) Specialized platforms (Devin AI, Replit AI) for autonomous development."
    },
    {
      question: "How do you choose the right AI tool for your project?",
      answer: "Consider: 1) Task complexity - simple autocomplete vs complex architecture, 2) Budget - free vs paid tiers, 3) Context needs - small snippets vs entire codebases, 4) Integration requirements - IDE plugins vs standalone tools, 5) Team workflow - individual vs collaborative features, 6) Language/framework support specific to your stack."
    },
    {
      question: "What is the difference between GitHub Copilot and ChatGPT for coding?",
      answer: "GitHub Copilot provides inline code suggestions directly in your IDE, trained on code repositories for context-aware completions. ChatGPT offers conversational interactions for explanations, refactoring, and problem-solving but requires copy-pasting code. Copilot is better for flow, ChatGPT for reasoning and learning."
    },
    {
      question: "What are the trade-offs between cloud-based and local AI models?",
      answer: "Cloud-based models (GPT-4, Claude) offer superior performance, large context windows, and regular updates but require internet, cost money, and raise privacy concerns. Local models (LLaMA, CodeLlama) provide privacy, offline access, and no recurring costs but have lower performance and require significant hardware resources."
    }
  ],

  ch4: [
    {
      question: "What are the key principles of effective prompt engineering?",
      answer: "Key principles include: 1) Be specific and clear about requirements, 2) Provide context and examples, 3) Define constraints and edge cases, 4) Use structured formats (Markdown, YAML), 5) Iterate and refine based on results, 6) Break complex tasks into smaller steps, 7) Specify desired output format and style."
    },
    {
      question: "How does Markdown improve prompts for AI coding assistants?",
      answer: "Markdown provides structure through headings, lists, code blocks, and emphasis, making prompts more readable for both humans and AI. It helps organize requirements, separate context from instructions, highlight important information, and format code examples clearly, leading to more accurate AI responses."
    },
    {
      question: "What is the role of context in prompt engineering?",
      answer: "Context tells the AI about the environment, constraints, existing code, and goals. Good context includes: project tech stack, coding standards, existing patterns, user requirements, and edge cases. More relevant context leads to more appropriate and maintainable code suggestions from AI."
    },
    {
      question: "How do you handle when AI generates incorrect or suboptimal code?",
      answer: "Steps to handle poor AI output: 1) Refine your prompt with more details, 2) Provide examples of desired output, 3) Point out specific issues and ask for corrections, 4) Break down complex requests into simpler steps, 5) Use iterative refinement, 6) Manually review and test all generated code, 7) Combine AI suggestions with your expertise."
    }
  ],

  ch5: [
    {
      question: "What is Specification-Driven Development (SDD)?",
      answer: "SDD is a methodology where detailed, executable specifications are written before implementation. These specs serve as contracts between requirements and code, especially powerful with AI tools that can generate code directly from well-written specifications. It emphasizes clarity, completeness, and validation of requirements upfront."
    },
    {
      question: "What are the essential elements of a good specification?",
      answer: "A complete specification includes: 1) Context (the why), 2) Clear objectives and goals, 3) Functional requirements with details, 4) Data models and interfaces, 5) API endpoints and contracts, 6) Edge cases and error handling, 7) Non-functional requirements (performance, security), 8) Success criteria and acceptance tests."
    },
    {
      question: "How does SDD improve AI-generated code quality?",
      answer: "SDD improves AI output by providing: comprehensive context for the AI, clear acceptance criteria to validate against, well-defined interfaces and contracts, explicit edge cases to handle, and a validation framework. The more detailed the spec, the more accurate and maintainable the AI-generated code becomes."
    },
    {
      question: "What is the difference between waterfall specifications and SDD?",
      answer: "Waterfall specs are often static, lengthy documents created once. SDD specifications are: living documents updated continuously, executable and testable, designed for AI consumption, focused on clarity over formality, iteratively refined based on implementation feedback, and serve as single source of truth throughout development."
    }
  ],

  ch6: [
    {
      question: "What is Spec-Driven Methodology in practice?",
      answer: "Spec-Driven Methodology involves: 1) Writing clear specifications first, 2) Reviewing specs with stakeholders, 3) Using AI to generate code from specs, 4) Validating generated code against specs, 5) Refining specs based on implementation learnings, 6) Maintaining specs as documentation, 7) Using specs for automated testing."
    },
    {
      question: "How do you write specifications that AI can understand effectively?",
      answer: "Write AI-friendly specs by: using structured formats (Markdown, YAML), being explicit about data types and constraints, providing input/output examples, defining edge cases clearly, specifying error handling, avoiding ambiguity, using consistent terminology, and including context about the broader system."
    },
    {
      question: "What tools and frameworks support Spec-Driven Development?",
      answer: "Tools include: OpenAPI/Swagger for APIs, TypeScript for type specifications, JSON Schema for data validation, Markdown for documentation, YAML for configuration, testing frameworks (Jest, Pytest) for validation, and AI coding assistants (Claude Code, GPT-4) for code generation from specs."
    },
    {
      question: "How do you validate that AI-generated code meets specifications?",
      answer: "Validation methods: 1) Automated tests derived from spec acceptance criteria, 2) Type checking and linting, 3) API contract testing, 4) Manual code review against spec requirements, 5) Integration tests for edge cases, 6) Performance benchmarks for non-functional requirements, 7) Security audits for sensitive operations."
    }
  ],

  ch7: [
    {
      question: "What is RAG (Retrieval-Augmented Generation)?",
      answer: "RAG combines information retrieval with AI generation. It retrieves relevant documents from a knowledge base using vector search, then provides this context to an LLM to generate accurate, grounded responses. This prevents hallucinations and allows AI to answer questions about specific documents or proprietary data."
    },
    {
      question: "How do vector embeddings work in RAG systems?",
      answer: "Vector embeddings convert text into high-dimensional numerical vectors that capture semantic meaning. Similar texts have similar vectors. In RAG, both documents and queries are embedded, then cosine similarity or other metrics find the most relevant documents to provide as context to the LLM for generation."
    },
    {
      question: "What are the key components of a RAG chatbot?",
      answer: "Key components: 1) Document ingestion and chunking, 2) Embedding model to convert text to vectors, 3) Vector database for similarity search (Qdrant, Pinecone), 4) Query embedding and retrieval logic, 5) LLM for generation with retrieved context, 6) User interface for interaction, 7) Source citation for transparency."
    },
    {
      question: "What are common challenges in building RAG systems and how to solve them?",
      answer: "Challenges include: poor chunking leading to lost context (solution: semantic chunking), irrelevant retrieval (solution: better embeddings and reranking), hallucinations despite context (solution: prompt engineering to stay grounded), slow performance (solution: caching and optimized vector search), and high costs (solution: hybrid search and smaller models)."
    }
  ],

  ch8: [
    {
      question: "What are the key phases of implementing an AI-driven project?",
      answer: "Implementation phases: 1) Requirements gathering and specification writing, 2) Choosing appropriate AI tools and models, 3) Prompt engineering and initial code generation, 4) Iterative refinement and debugging, 5) Testing and validation against specs, 6) Code review and security audit, 7) Deployment and monitoring, 8) Continuous learning and improvement."
    },
    {
      question: "How do you debug and troubleshoot AI-generated code?",
      answer: "Debugging strategies: 1) Read and understand the generated code first, 2) Use traditional debugging tools (breakpoints, logging), 3) Check for common AI mistakes (hallucinated APIs, incorrect types), 4) Refine prompts with specific bug details, 5) Break complex code into testable units, 6) Validate against spec requirements, 7) Use AI to explain its own code."
    },
    {
      question: "What testing strategies work best for AI-generated code?",
      answer: "Testing strategies: 1) Write tests based on specification acceptance criteria, 2) Unit test individual functions with edge cases, 3) Integration tests for component interactions, 4) Property-based testing for invariants, 5) Use AI to generate test cases, 6) Manual review of critical paths, 7) Performance and security testing, 8) Regression tests for bug fixes."
    },
    {
      question: "How do you maintain and evolve AI-generated codebases?",
      answer: "Maintenance practices: 1) Keep specifications updated as requirements change, 2) Document AI-generated code with human explanations, 3) Refactor regularly to maintain code quality, 4) Use version control with meaningful commits, 5) Conduct periodic code reviews, 6) Update dependencies and security patches, 7) Regenerate code sections as AI models improve, 8) Train team members on the AI-driven workflow."
    }
  ]
};
