import React, { useState } from 'react';
import styles from './styles.module.css';

interface MCQOption {
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  question: string;
  options: MCQOption[];
  explanation: string;
}

interface MCQProps {
  questions: MCQQuestion[];
  title?: string;
}

export default function MCQ({ questions, title = "Chapter Quiz" }: MCQProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted[questionIndex]) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitAnswer = (questionIndex: number) => {
    const newSubmitted = [...submitted];
    newSubmitted[questionIndex] = true;
    setSubmitted(newSubmitted);

    const isCorrect = questions[questionIndex].options[selectedAnswers[questionIndex]]?.isCorrect;
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleSubmitAll = () => {
    let correctCount = 0;
    const newSubmitted = questions.map(() => true);

    questions.forEach((question, index) => {
      if (selectedAnswers[index] !== -1 && question.options[selectedAnswers[index]].isCorrect) {
        correctCount++;
      }
    });

    setSubmitted(newSubmitted);
    setScore(correctCount);
    setShowScore(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setSubmitted(new Array(questions.length).fill(false));
    setScore(0);
    setShowScore(false);
  };

  const allAnswered = selectedAnswers.every(answer => answer !== -1);
  const allSubmitted = submitted.every(sub => sub);

  return (
    <div className={styles.mcqContainer}>
      <div className={styles.header}>
        <h3>📝 {title}</h3>
        <p className={styles.subtitle}>Test your understanding with these multiple choice questions</p>
        {showScore && (
          <div className={styles.scoreCard}>
            <div className={styles.scoreBig}>
              {score}/{questions.length}
            </div>
            <div className={styles.scorePercentage}>
              {Math.round((score / questions.length) * 100)}%
            </div>
            <div className={styles.scoreLabel}>
              {score === questions.length ? '🎉 Perfect Score!' :
               score >= questions.length * 0.7 ? '✅ Great Job!' :
               score >= questions.length * 0.5 ? '👍 Good Effort!' :
               '📚 Keep Learning!'}
            </div>
          </div>
        )}
      </div>

      <div className={styles.questionsList}>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>Question {qIndex + 1}</span>
              {submitted[qIndex] && (
                <span className={
                  question.options[selectedAnswers[qIndex]]?.isCorrect
                    ? styles.correctBadge
                    : styles.incorrectBadge
                }>
                  {question.options[selectedAnswers[qIndex]]?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              )}
            </div>

            <div className={styles.questionText}>{question.question}</div>

            <div className={styles.optionsList}>
              {question.options.map((option, oIndex) => {
                const isSelected = selectedAnswers[qIndex] === oIndex;
                const isSubmitted = submitted[qIndex];
                const isCorrect = option.isCorrect;

                let optionClass = styles.option;
                if (isSelected) optionClass += ` ${styles.selected}`;
                if (isSubmitted && isSelected && isCorrect) optionClass += ` ${styles.correct}`;
                if (isSubmitted && isSelected && !isCorrect) optionClass += ` ${styles.incorrect}`;
                if (isSubmitted && !isSelected && isCorrect) optionClass += ` ${styles.showCorrect}`;

                return (
                  <button
                    key={oIndex}
                    className={optionClass}
                    onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    disabled={submitted[qIndex]}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + oIndex)}
                    </span>
                    <span className={styles.optionText}>{option.text}</span>
                    {isSubmitted && isCorrect && (
                      <span className={styles.correctIcon}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {submitted[qIndex] && (
              <div className={styles.explanation}>
                <div className={styles.explanationLabel}>💡 Explanation:</div>
                <div className={styles.explanationText}>{question.explanation}</div>
              </div>
            )}

            {!submitted[qIndex] && selectedAnswers[qIndex] !== -1 && (
              <button
                className={styles.submitButton}
                onClick={() => handleSubmitAnswer(qIndex)}
              >
                Submit Answer
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        {!allSubmitted && (
          <button
            className={styles.submitAllButton}
            onClick={handleSubmitAll}
            disabled={!allAnswered}
          >
            {allAnswered ? 'Submit All Answers' : `Answer All Questions (${selectedAnswers.filter(a => a !== -1).length}/${questions.length})`}
          </button>
        )}
        {allSubmitted && (
          <button className={styles.retryButton} onClick={resetQuiz}>
            🔄 Retry Quiz
          </button>
        )}
      </div>
    </div>
  );
}

// Chapter-specific MCQs
export const ChapterMCQ = {
  ch1: [
    {
      question: "What is the primary function of the transformer architecture in Large Language Models?",
      options: [
        { text: "To compress data for storage", isCorrect: false },
        { text: "To use self-attention mechanisms to understand context", isCorrect: true },
        { text: "To convert images to text", isCorrect: false },
        { text: "To optimize database queries", isCorrect: false }
      ],
      explanation: "Transformers use self-attention mechanisms to understand relationships between words in context, allowing LLMs to generate coherent and contextually relevant text."
    },
    {
      question: "What are tokens in the context of LLMs?",
      options: [
        { text: "Security credentials for API access", isCorrect: false },
        { text: "Basic units of text that LLMs process (words, subwords, or characters)", isCorrect: true },
        { text: "Currency used to pay for AI services", isCorrect: false },
        { text: "Encryption keys for data security", isCorrect: false }
      ],
      explanation: "Tokens are the fundamental units LLMs process. Text is broken down into tokens (which can be words, parts of words, or characters) before being processed by the model."
    },
    {
      question: "What is the difference between fine-tuning and prompt engineering?",
      options: [
        { text: "Fine-tuning is cheaper and faster than prompt engineering", isCorrect: false },
        { text: "Prompt engineering requires retraining the entire model", isCorrect: false },
        { text: "Fine-tuning retrains the model on specific data, while prompt engineering crafts effective instructions", isCorrect: true },
        { text: "They are the same thing with different names", isCorrect: false }
      ],
      explanation: "Fine-tuning involves retraining an LLM on specialized data (costly and time-consuming), while prompt engineering guides the model through well-crafted instructions without retraining."
    },
    {
      question: "What is a context window in LLMs?",
      options: [
        { text: "A graphical user interface for AI tools", isCorrect: false },
        { text: "The maximum amount of text an LLM can consider at once", isCorrect: true },
        { text: "The time period during which AI generates responses", isCorrect: false },
        { text: "The physical window on your screen displaying AI output", isCorrect: false }
      ],
      explanation: "A context window is the maximum amount of text (measured in tokens) that an LLM can process simultaneously. Larger context windows allow better understanding of longer documents but increase computational costs."
    },
    {
      question: "Why is AI-driven development transforming software engineering?",
      options: [
        { text: "It completely replaces human developers", isCorrect: false },
        { text: "It accelerates coding, automates tasks, and allows developers to focus on problem-solving", isCorrect: true },
        { text: "It eliminates the need for testing and debugging", isCorrect: false },
        { text: "It only works for simple applications", isCorrect: false }
      ],
      explanation: "AI-driven development enhances productivity by automating routine tasks, generating code from specifications, and assisting with debugging, allowing developers to focus on high-level design and complex problem-solving."
    }
  ],

  ch2: [
    {
      question: "What is the main difference between traditional development and AI-driven development?",
      options: [
        { text: "AI-driven development doesn't require any coding skills", isCorrect: false },
        { text: "AI-driven development uses AI as a pair programmer to assist with coding tasks", isCorrect: true },
        { text: "Traditional development is always faster", isCorrect: false },
        { text: "AI-driven development can only be used for web applications", isCorrect: false }
      ],
      explanation: "AI-driven development leverages AI tools as intelligent assistants that help with code generation, debugging, testing, and documentation, while traditional development relies entirely on manual coding by humans."
    },
    {
      question: "Which of the following is NOT a benefit of AI coding assistants?",
      options: [
        { text: "Faster code generation from natural language", isCorrect: false },
        { text: "Automated bug detection and testing", isCorrect: false },
        { text: "Guaranteed bug-free code every time", isCorrect: true },
        { text: "Code review and refactoring suggestions", isCorrect: false }
      ],
      explanation: "AI assistants are powerful but not perfect. They can help detect bugs and improve code quality, but they don't guarantee bug-free code. Human review and testing are still essential."
    },
    {
      question: "What is a common pitfall when using AI coding assistants?",
      options: [
        { text: "They are too slow to be practical", isCorrect: false },
        { text: "Over-relying on AI without understanding the generated code", isCorrect: true },
        { text: "They only work with Python", isCorrect: false },
        { text: "They require expensive hardware", isCorrect: false }
      ],
      explanation: "A major pitfall is blindly accepting AI-generated code without understanding it. This can lead to security vulnerabilities, bugs, and maintainability issues. Always review and test AI-generated code."
    },
    {
      question: "How should developers integrate AI tools into their workflow?",
      options: [
        { text: "Use AI to write all code and never review it", isCorrect: false },
        { text: "Only use AI for documentation, never for actual code", isCorrect: false },
        { text: "Use AI for initial drafts and boilerplate, then review and refine", isCorrect: true },
        { text: "Replace all testing with AI-generated tests", isCorrect: false }
      ],
      explanation: "Effective integration involves using AI for initial code generation and boilerplate, then applying human expertise to review, test, and refine the output. This combines AI efficiency with human judgment."
    },
    {
      question: "What role does prompt engineering play in AI-driven development?",
      options: [
        { text: "It's only useful for chatbots", isCorrect: false },
        { text: "It helps developers craft clear instructions to get better AI-generated code", isCorrect: true },
        { text: "It's a waste of time compared to traditional coding", isCorrect: false },
        { text: "It only works with specific programming languages", isCorrect: false }
      ],
      explanation: "Prompt engineering is crucial for AI-driven development. Well-crafted prompts with clear requirements, context, and examples lead to more accurate, maintainable, and useful AI-generated code."
    }
  ],

  ch3: [
    {
      question: "Which type of AI tool provides inline code suggestions directly in your IDE?",
      options: [
        { text: "Chat-based assistants like ChatGPT", isCorrect: false },
        { text: "IDE-integrated tools like GitHub Copilot", isCorrect: true },
        { text: "CLI tools like Aider", isCorrect: false },
        { text: "Specialized platforms like Devin AI", isCorrect: false }
      ],
      explanation: "IDE-integrated tools like GitHub Copilot, Cursor, and Tabnine provide real-time inline code suggestions as you type, seamlessly integrating with your development environment."
    },
    {
      question: "What is the main advantage of cloud-based AI models over local models?",
      options: [
        { text: "They work without internet connection", isCorrect: false },
        { text: "They are completely free to use", isCorrect: false },
        { text: "They offer superior performance and regular updates", isCorrect: true },
        { text: "They guarantee complete data privacy", isCorrect: false }
      ],
      explanation: "Cloud-based models (GPT-4, Claude) provide state-of-the-art performance, large context windows, and regular updates. However, they require internet connectivity and raise privacy considerations."
    },
    {
      question: "When choosing an AI coding tool, which factor is MOST important for large codebases?",
      options: [
        { text: "The color scheme of the interface", isCorrect: false },
        { text: "Context window size and codebase understanding", isCorrect: true },
        { text: "The number of programming languages supported", isCorrect: false },
        { text: "The speed of simple autocomplete", isCorrect: false }
      ],
      explanation: "For large codebases, context window size is crucial. Tools with larger context windows can understand more of your codebase at once, leading to more relevant and accurate suggestions."
    },
    {
      question: "What distinguishes GitHub Copilot from ChatGPT for coding tasks?",
      options: [
        { text: "Copilot requires no API key while ChatGPT does", isCorrect: false },
        { text: "Copilot provides inline suggestions in your IDE, ChatGPT offers conversational help", isCorrect: true },
        { text: "ChatGPT is always more accurate than Copilot", isCorrect: false },
        { text: "Copilot only works with JavaScript", isCorrect: false }
      ],
      explanation: "GitHub Copilot integrates directly into your IDE for inline suggestions as you type, while ChatGPT provides conversational assistance for explanations, problem-solving, and refactoring through a chat interface."
    },
    {
      question: "Which AI tool category is best for terminal-based workflows?",
      options: [
        { text: "IDE plugins", isCorrect: false },
        { text: "Web-based chatbots", isCorrect: false },
        { text: "CLI tools like Claude Code or Aider", isCorrect: true },
        { text: "Specialized autonomous platforms", isCorrect: false }
      ],
      explanation: "CLI tools like Claude Code and Aider are specifically designed for command-line workflows, allowing developers who prefer terminal-based development to leverage AI assistance."
    }
  ],

  ch4: [
    {
      question: "What is the most important principle of effective prompt engineering?",
      options: [
        { text: "Use as few words as possible", isCorrect: false },
        { text: "Be specific and provide clear context with examples", isCorrect: true },
        { text: "Always use technical jargon", isCorrect: false },
        { text: "Never mention edge cases", isCorrect: false }
      ],
      explanation: "Effective prompts are specific, provide clear context, include examples, and define constraints. Clarity and detail lead to more accurate AI responses."
    },
    {
      question: "How does Markdown improve prompts for AI coding assistants?",
      options: [
        { text: "It makes prompts look prettier but doesn't affect results", isCorrect: false },
        { text: "It provides structure through headings, lists, and code blocks", isCorrect: true },
        { text: "It encrypts sensitive information in prompts", isCorrect: false },
        { text: "It reduces the token count of prompts", isCorrect: false }
      ],
      explanation: "Markdown provides structure that makes prompts more readable for both humans and AI. Headings, lists, code blocks, and emphasis help organize requirements and highlight important information."
    },
    {
      question: "What should you include in the context of a prompt?",
      options: [
        { text: "Only the immediate task with no background", isCorrect: false },
        { text: "Project tech stack, coding standards, existing patterns, and requirements", isCorrect: true },
        { text: "Personal information about team members", isCorrect: false },
        { text: "Unrelated code from different projects", isCorrect: false }
      ],
      explanation: "Good context includes relevant information about your tech stack, coding standards, existing code patterns, user requirements, and constraints. More relevant context leads to better AI suggestions."
    },
    {
      question: "What should you do when AI generates incorrect or suboptimal code?",
      options: [
        { text: "Give up and write all code manually", isCorrect: false },
        { text: "Use the code anyway without changes", isCorrect: false },
        { text: "Refine your prompt with more details and iterate", isCorrect: true },
        { text: "Switch to a different programming language", isCorrect: false }
      ],
      explanation: "When AI output is poor, refine your prompt with more specific details, provide examples of desired output, point out issues, and iterate. Use AI as a collaborative tool, not a one-shot solution."
    },
    {
      question: "Why is it important to break complex tasks into smaller steps in prompts?",
      options: [
        { text: "To confuse the AI model", isCorrect: false },
        { text: "To make prompts longer and more impressive", isCorrect: false },
        { text: "AI performs better with focused, manageable tasks", isCorrect: true },
        { text: "It's not important; always use one giant prompt", isCorrect: false }
      ],
      explanation: "Breaking complex tasks into smaller, focused steps helps AI understand each component better, produces more accurate results, and makes debugging easier when issues arise."
    }
  ],

  ch5: [
    {
      question: "What is the core principle of Specification-Driven Development (SDD)?",
      options: [
        { text: "Write code first, then document it", isCorrect: false },
        { text: "Write detailed specifications before implementation", isCorrect: true },
        { text: "Skip documentation entirely", isCorrect: false },
        { text: "Only write specifications for complex features", isCorrect: false }
      ],
      explanation: "SDD emphasizes creating clear, detailed specifications before writing any code. These specs serve as contracts between requirements and implementation, especially powerful with AI code generation."
    },
    {
      question: "Which is NOT an essential element of a good specification?",
      options: [
        { text: "Context explaining the 'why'", isCorrect: false },
        { text: "Functional requirements with details", isCorrect: false },
        { text: "The developer's personal preferences", isCorrect: true },
        { text: "Success criteria and acceptance tests", isCorrect: false }
      ],
      explanation: "A complete specification includes context, objectives, functional requirements, data models, edge cases, non-functional requirements, and success criteria. Personal preferences are not part of specifications."
    },
    {
      question: "How does SDD improve AI-generated code quality?",
      options: [
        { text: "It doesn't; AI works the same with or without specs", isCorrect: false },
        { text: "It provides comprehensive context and clear acceptance criteria for validation", isCorrect: true },
        { text: "It makes the AI generate code faster", isCorrect: false },
        { text: "It reduces the need for testing", isCorrect: false }
      ],
      explanation: "Detailed specifications provide AI with comprehensive context, clear interfaces, explicit edge cases, and validation criteria, resulting in more accurate and maintainable code."
    },
    {
      question: "What makes SDD specifications different from traditional waterfall documentation?",
      options: [
        { text: "SDD specs are never updated after creation", isCorrect: false },
        { text: "SDD specs are living documents, executable, and designed for AI consumption", isCorrect: true },
        { text: "SDD specs are shorter and less detailed", isCorrect: false },
        { text: "There is no difference", isCorrect: false }
      ],
      explanation: "Unlike static waterfall docs, SDD specifications are living documents that are continuously updated, executable/testable, and optimized for AI tools to generate code from them."
    },
    {
      question: "What should specifications include regarding edge cases?",
      options: [
        { text: "Nothing; edge cases can be figured out during implementation", isCorrect: false },
        { text: "Explicit definitions of edge cases and how to handle them", isCorrect: true },
        { text: "Only the most common edge case", isCorrect: false },
        { text: "A note saying 'handle edge cases appropriately'", isCorrect: false }
      ],
      explanation: "Good specifications explicitly define edge cases and specify exactly how they should be handled. This prevents ambiguity and ensures AI-generated code properly addresses all scenarios."
    }
  ],

  ch6: [
    {
      question: "In Spec-Driven Methodology, when should specifications be reviewed?",
      options: [
        { text: "Only after all code is written", isCorrect: false },
        { text: "Before AI generates code from them", isCorrect: true },
        { text: "Never; specifications don't need review", isCorrect: false },
        { text: "Only when bugs are found", isCorrect: false }
      ],
      explanation: "Specifications should be reviewed with stakeholders before code generation to ensure alignment, catch issues early, and provide a solid foundation for AI-assisted implementation."
    },
    {
      question: "How should specifications be structured for AI to understand them effectively?",
      options: [
        { text: "As free-form text with no structure", isCorrect: false },
        { text: "Using structured formats like Markdown or YAML with explicit data types", isCorrect: true },
        { text: "As images or diagrams only", isCorrect: false },
        { text: "In natural language without any technical details", isCorrect: false }
      ],
      explanation: "AI-friendly specs use structured formats (Markdown, YAML), are explicit about data types and constraints, include examples, and avoid ambiguity through consistent terminology."
    },
    {
      question: "Which tool is commonly used for API specifications in Spec-Driven Development?",
      options: [
        { text: "Microsoft Word", isCorrect: false },
        { text: "OpenAPI/Swagger", isCorrect: true },
        { text: "Adobe Photoshop", isCorrect: false },
        { text: "Notepad", isCorrect: false }
      ],
      explanation: "OpenAPI (formerly Swagger) is the industry standard for API specifications, providing a structured way to define endpoints, request/response formats, and validation rules."
    },
    {
      question: "How do you validate that AI-generated code meets specifications?",
      options: [
        { text: "Just trust that the AI got it right", isCorrect: false },
        { text: "Use automated tests derived from spec acceptance criteria", isCorrect: true },
        { text: "Only check if it compiles", isCorrect: false },
        { text: "Validation isn't necessary with AI-generated code", isCorrect: false }
      ],
      explanation: "Validation requires automated tests based on acceptance criteria, type checking, API contract testing, code review, and integration tests for edge cases specified in the spec."
    },
    {
      question: "What role do specifications play after code is generated?",
      options: [
        { text: "They should be deleted to save space", isCorrect: false },
        { text: "They serve as living documentation and are updated as requirements change", isCorrect: true },
        { text: "They are archived and never looked at again", isCorrect: false },
        { text: "They are only useful during initial development", isCorrect: false }
      ],
      explanation: "Specifications remain valuable as living documentation, single source of truth, basis for automated testing, and guides for future changes. They should be updated as requirements evolve."
    }
  ],

  ch7: [
    {
      question: "What does RAG stand for in AI systems?",
      options: [
        { text: "Random Access Generation", isCorrect: false },
        { text: "Retrieval-Augmented Generation", isCorrect: true },
        { text: "Rapid Application Generator", isCorrect: false },
        { text: "Recursive Algorithm Gateway", isCorrect: false }
      ],
      explanation: "RAG stands for Retrieval-Augmented Generation. It combines information retrieval (searching documents) with AI generation to provide accurate, context-aware responses based on specific data."
    },
    {
      question: "How do vector embeddings enable semantic search in RAG?",
      options: [
        { text: "They compress files to save storage space", isCorrect: false },
        { text: "They convert text to numerical vectors that capture meaning", isCorrect: true },
        { text: "They translate text between languages", isCorrect: false },
        { text: "They encrypt data for security", isCorrect: false }
      ],
      explanation: "Vector embeddings convert text into high-dimensional numerical vectors that capture semantic meaning. Similar texts have similar vectors, enabling similarity search for relevant documents."
    },
    {
      question: "Which component stores vector embeddings in a RAG system?",
      options: [
        { text: "Traditional SQL database", isCorrect: false },
        { text: "Vector database like Qdrant or Pinecone", isCorrect: true },
        { text: "Text file on disk", isCorrect: false },
        { text: "Browser localStorage", isCorrect: false }
      ],
      explanation: "Vector databases like Qdrant, Pinecone, or Weaviate are specifically designed to store and efficiently search through vector embeddings using similarity metrics."
    },
    {
      question: "What is a common challenge in RAG systems?",
      options: [
        { text: "They are too simple to be useful", isCorrect: false },
        { text: "Poor chunking can lead to lost context", isCorrect: true },
        { text: "They never make mistakes", isCorrect: false },
        { text: "They only work with English text", isCorrect: false }
      ],
      explanation: "Common RAG challenges include poor chunking losing context, irrelevant retrieval, hallucinations despite context, slow performance, and high costs. Solutions include semantic chunking, reranking, and prompt engineering."
    },
    {
      question: "Why is source citation important in RAG chatbots?",
      options: [
        { text: "It makes the response longer", isCorrect: false },
        { text: "It provides transparency and allows users to verify information", isCorrect: true },
        { text: "It's not important; citations are optional", isCorrect: false },
        { text: "It confuses users", isCorrect: false }
      ],
      explanation: "Source citations provide transparency, allow users to verify information, build trust, and enable them to explore original documents for deeper understanding. They're essential for RAG system credibility."
    }
  ],

  ch8: [
    {
      question: "What is the first phase of implementing an AI-driven project?",
      options: [
        { text: "Deploy to production immediately", isCorrect: false },
        { text: "Requirements gathering and specification writing", isCorrect: true },
        { text: "Testing and debugging", isCorrect: false },
        { text: "Marketing the product", isCorrect: false }
      ],
      explanation: "The first phase is gathering requirements and writing clear specifications. This foundation guides all subsequent AI-assisted development, ensuring the generated code meets actual needs."
    },
    {
      question: "What should you do FIRST when debugging AI-generated code?",
      options: [
        { text: "Delete all the code and start over", isCorrect: false },
        { text: "Read and understand the generated code", isCorrect: true },
        { text: "Immediately ask AI to fix it without investigating", isCorrect: false },
        { text: "Deploy to production and hope it works", isCorrect: false }
      ],
      explanation: "Always read and understand AI-generated code first. Then use traditional debugging tools, check for common AI mistakes, and refine prompts with specific bug details for fixes."
    },
    {
      question: "Which testing strategy is most important for AI-generated code?",
      options: [
        { text: "Skip testing since AI code is always perfect", isCorrect: false },
        { text: "Only test manually without automation", isCorrect: false },
        { text: "Write tests based on specification acceptance criteria", isCorrect: true },
        { text: "Just run the code once and assume it works", isCorrect: false }
      ],
      explanation: "Tests should be based on specification acceptance criteria, including unit tests for functions, integration tests for components, edge case testing, and validation against requirements."
    },
    {
      question: "How should AI-generated codebases be maintained over time?",
      options: [
        { text: "Never update them; AI code doesn't need maintenance", isCorrect: false },
        { text: "Keep specifications updated and refactor regularly", isCorrect: true },
        { text: "Delete and regenerate everything monthly", isCorrect: false },
        { text: "Only fix critical bugs, ignore everything else", isCorrect: false }
      ],
      explanation: "Maintain AI-generated code by keeping specifications current, documenting with human explanations, refactoring regularly, conducting code reviews, and updating as AI models improve."
    },
    {
      question: "What is the role of human oversight in AI-driven development?",
      options: [
        { text: "Humans are completely unnecessary", isCorrect: false },
        { text: "Humans review, validate, and make critical architectural decisions", isCorrect: true },
        { text: "Humans only write documentation", isCorrect: false },
        { text: "Humans are only needed for deployment", isCorrect: false }
      ],
      explanation: "Human oversight remains crucial for reviewing code, validating against requirements, making architectural decisions, ensuring security, and maintaining code quality. AI assists but doesn't replace human judgment."
    }
  ]
};
