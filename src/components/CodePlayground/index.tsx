import React from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  SandpackProps
} from '@codesandbox/sandpack-react';
import styles from './styles.module.css';

interface CodePlaygroundProps {
  title?: string;
  files?: Record<string, string>;
  template?: SandpackProps['template'];
  showConsole?: boolean;
  showPreview?: boolean;
  editorHeight?: string;
}

export default function CodePlayground({
  title = "Interactive Code Playground",
  files,
  template = "vanilla",
  showConsole = true,
  showPreview = false,
  editorHeight = "400px"
}: CodePlaygroundProps) {
  return (
    <div className={styles.playgroundContainer}>
      {title && (
        <div className={styles.header}>
          <h3>💻 {title}</h3>
          <span className={styles.badge}>Live Editor</span>
        </div>
      )}

      <SandpackProvider
        template={template}
        files={files}
        theme="dark"
        options={{
          classes: {
            'sp-wrapper': styles.sandpackWrapper,
            'sp-layout': styles.sandpackLayout,
          }
        }}
      >
        <SandpackLayout style={{ minHeight: editorHeight }}>
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: editorHeight }}
          />
          {showConsole && (
            <SandpackConsole
              showHeader
              style={{ height: editorHeight }}
            />
          )}
          {showPreview && (
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              showRunButton={true}
              style={{ height: editorHeight }}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>

      <div className={styles.info}>
        💡 Edit the code on the left - {showConsole ? "see output in the Console" : "preview"} on the right! {showPreview && "Click ▶️ Run to execute."}
      </div>
    </div>
  );
}

// Pre-made examples for chapters
export const Examples = {
  // Chapter 3: RAG Basics
  ragBasics: {
    title: "RAG System - Basic Concept",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Simple RAG concept demonstration
// Step 1: Document chunks (normally from a vector DB)
const knowledgeBase = [
  {
    text: "RAG stands for Retrieval-Augmented Generation",
    embedding: [0.1, 0.2, 0.3] // simplified vector
  },
  {
    text: "RAG combines search with AI generation",
    embedding: [0.15, 0.25, 0.35]
  },
  {
    text: "Vector databases store embeddings for fast search",
    embedding: [0.5, 0.6, 0.7]
  }
];

// Step 2: Search function (cosine similarity)
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

// Step 3: Search for relevant context
function search(queryEmbedding: number[], topK = 2) {
  return knowledgeBase
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Step 4: Generate answer with context
function ragQuery(query: string) {
  const queryEmbedding = [0.12, 0.22, 0.32]; // simplified
  const context = search(queryEmbedding);

  console.log("Query:", query);
  console.log("\\nRetrieved Context:");
  context.forEach((doc, i) => {
    console.log(\`\${i + 1}. \${doc.text} (score: \${doc.score.toFixed(2)})\`);
  });

  // In real RAG, this context would go to an LLM
  return context.map(d => d.text).join(" ");
}

// Try it!
const answer = ragQuery("What is RAG?");
console.log("\\nFinal Answer:", answer);
`,
    }
  },

  // Chapter 4: Vector Embeddings
  vectorEmbeddings: {
    title: "Understanding Vector Embeddings",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Vector Embeddings Demo
// In real systems, embeddings come from AI models

// Example: Word embeddings (simplified 3D vectors)
const wordVectors: Record<string, number[]> = {
  "king": [0.5, 0.1, 0.8],
  "queen": [0.5, 0.9, 0.8],
  "man": [0.3, 0.1, 0.2],
  "woman": [0.3, 0.9, 0.2],
  "cat": [0.1, 0.5, 0.1],
  "dog": [0.15, 0.5, 0.12],
};

// Calculate cosine similarity
function similarity(vec1: number[], vec2: number[]): number {
  const dot = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dot / (mag1 * mag2);
}

// Find most similar words
function findSimilar(word: string, topN = 3) {
  const wordVec = wordVectors[word];
  if (!wordVec) return [];

  return Object.entries(wordVectors)
    .filter(([w]) => w !== word)
    .map(([w, vec]) => ({
      word: w,
      similarity: similarity(wordVec, vec)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

// Vector arithmetic: king - man + woman ≈ queen
function vectorArithmetic() {
  const king = wordVectors["king"];
  const man = wordVectors["man"];
  const woman = wordVectors["woman"];

  // king - man + woman
  const result = king.map((val, i) => val - man[i] + woman[i]);

  // Find closest word to result
  const closest = Object.entries(wordVectors)
    .map(([w, vec]) => ({
      word: w,
      distance: similarity(result, vec)
    }))
    .sort((a, b) => b.distance - a.distance)[0];

  console.log("king - man + woman ≈", closest.word);
  console.log("Similarity:", closest.distance.toFixed(3));
}

// Try it!
console.log("Words similar to 'king':");
findSimilar("king").forEach(({ word, similarity }) => {
  console.log(\`  \${word}: \${similarity.toFixed(3)}\`);
});

console.log("\\nVector arithmetic:");
vectorArithmetic();
`,
    }
  },

  // Chapter 5: Prompt Engineering
  promptEngineering: {
    title: "Prompt Engineering Best Practices",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Prompt Engineering Examples

interface PromptTemplate {
  name: string;
  template: string;
  example: string;
}

const promptTemplates: PromptTemplate[] = [
  {
    name: "Few-Shot Learning",
    template: \`Here are examples:
Q: [example question 1]
A: [example answer 1]

Q: [example question 2]
A: [example answer 2]

Q: [your question]
A:\`,
    example: "Teach AI by example"
  },
  {
    name: "Chain of Thought",
    template: \`Let's solve this step by step:
1. [First step]
2. [Second step]
3. [Third step]
Therefore: [conclusion]\`,
    example: "Break down complex reasoning"
  },
  {
    name: "Role-Based",
    template: \`You are a [role] with expertise in [domain].
Your task is to [specific task].
Consider: [important factors]
Output: [format]\`,
    example: "Give AI a specific persona"
  },
  {
    name: "Structured Output",
    template: \`Generate a response in this format:
{
  "summary": "...",
  "details": [...],
  "confidence": 0-1
}\`,
    example: "Get consistent JSON/structured data"
  }
];

// Demonstrate prompt construction
function buildPrompt(
  role: string,
  task: string,
  context: string,
  constraints: string[]
): string {
  return \`You are \${role}.

Task: \${task}

Context:
\${context}

Constraints:
\${constraints.map((c, i) => \`\${i + 1}. \${c}\`).join('\\n')}

Please provide a clear, concise response.\`;
}

// Example usage
const prompt = buildPrompt(
  "an expert AI engineer",
  "Explain RAG to a beginner",
  "The user has basic programming knowledge but no AI experience",
  [
    "Keep it under 100 words",
    "Use analogies",
    "Avoid jargon"
  ]
);

console.log("=== Prompt Templates ===\\n");
promptTemplates.forEach(({ name, example }) => {
  console.log(\`\${name}: \${example}\`);
});

console.log("\\n=== Example Constructed Prompt ===\\n");
console.log(prompt);
`,
    }
  },

  // Chapter 1: Understanding Tokens
  tokensAndContext: {
    title: "Understanding Tokens and Context",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Understanding LLM Tokens and Context

// Simulate simple tokenization
function tokenize(text: string): string[] {
  // Real tokenizers are more sophisticated
  return text.toLowerCase().match(/\\b\\w+\\b|[.,!?]/g) || [];
}

// Calculate token count
function countTokens(text: string): number {
  return tokenize(text).length;
}

// Estimate context window usage
function estimateContextUsage(text: string, maxTokens: number = 4096): {
  tokens: number;
  percentage: number;
  remaining: number;
} {
  const tokens = countTokens(text);
  return {
    tokens,
    percentage: Math.round((tokens / maxTokens) * 100),
    remaining: maxTokens - tokens
  };
}

// Examples
const shortText = "Hello, how are you?";
const longText = "Artificial Intelligence is transforming software development by providing intelligent code suggestions, automated testing, and enhanced debugging capabilities.";

console.log("=== Token Analysis ===\\n");

console.log("Short text:", shortText);
console.log("Tokens:", tokenize(shortText));
console.log("Count:", countTokens(shortText), "tokens\\n");

console.log("Long text:", longText);
console.log("Tokens:", tokenize(longText));
console.log("Count:", countTokens(longText), "tokens\\n");

// Context usage for GPT-4
const usage = estimateContextUsage(longText, 8192);
console.log("Context Usage (GPT-4):");
console.log(\`  Used: \${usage.tokens} tokens (\${usage.percentage}%)\`);
console.log(\`  Remaining: \${usage.remaining} tokens\`);
`,
    }
  },

  // Chapter 2 & 8: Spec-Driven Development
  specValidator: {
    title: "Specification Completeness Validator",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Validates spec completeness
interface Specification {
  goal: string;
  requirements: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  examples: Example[];
}

interface Example {
  input: any;
  expectedOutput: any;
  description: string;
}

function validateSpec(spec: Specification): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (!spec.goal) issues.push("Missing goal");
  if (spec.requirements.length === 0) issues.push("No requirements defined");
  if (spec.acceptanceCriteria.length === 0) issues.push("No acceptance criteria");
  if (spec.examples.length === 0) issues.push("No examples provided");
  return { valid: issues.length === 0, issues };
}

// Test spec
const authSpec: Specification = {
  goal: "Implement secure user authentication system",
  requirements: [
    "Users can register with email and password",
    "Password must be hashed before storage",
    "JWT tokens for session management"
  ],
  constraints: [
    "Password minimum 8 characters",
    "Must include uppercase, lowercase, number"
  ],
  acceptanceCriteria: [
    "User can successfully register with valid credentials",
    "Invalid credentials return appropriate error"
  ],
  examples: [
    {
      input: { email: "user@example.com", password: "SecurePass123" },
      expectedOutput: { success: true, token: "jwt_token_here" },
      description: "Valid registration"
    }
  ]
};

const validation = validateSpec(authSpec);
console.log("=== Specification Validation ===\\n");
console.log("Spec Goal:", authSpec.goal);
console.log("\\nRequirements:", authSpec.requirements.length);
authSpec.requirements.forEach((req, i) => {
  console.log(\`  \${i + 1}. \${req}\`);
});
console.log("\\nValidation Result:");
console.log("Valid:", validation.valid);
if (validation.issues.length > 0) {
  console.log("Issues:", validation.issues);
}
`,
    }
  },

  // Chapter 4: Testing AI-Generated Code
  testingExample: {
    title: "Testing AI-Generated Code",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Testing a generated function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

interface TestCase {
  input: string;
  expected: boolean;
  description: string;
}

const testCases: TestCase[] = [
  { input: "user@example.com", expected: true, description: "Valid email" },
  { input: "user@example", expected: false, description: "Missing TLD" },
  { input: "user.example.com", expected: false, description: "Missing @" },
  { input: "@example.com", expected: false, description: "Missing local part" },
  { input: "user @example.com", expected: false, description: "Contains space" },
  { input: "", expected: false, description: "Empty string" }
];

console.log("=== Email Validation Tests ===\\n");
let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected, description }) => {
  const result = validateEmail(input);
  const status = result === expected ? "✓ PASS" : "✗ FAIL";
  console.log(\`\${status}: \${description}\`);
  console.log(\`  Input: "\${input}"\`);
  console.log(\`  Expected: \${expected}, Got: \${result}\\n\`);
  if (result === expected) passed++;
  else failed++;
});

console.log("=== Test Summary ===");
console.log(\`Total: \${testCases.length}\`);
console.log(\`Passed: \${passed}\`);
console.log(\`Failed: \${failed}\`);
console.log(\`Success Rate: \${((passed / testCases.length) * 100).toFixed(1)}%\`);
`,
    }
  },

  // Chapter 6: AI Tool Selection
  toolSelection: {
    title: "AI Tool Selection Decision Tree",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// AI Tool Selection Logic
interface ToolRecommendation {
  tool: string;
  reason: string;
  alternatives: string[];
}

interface ProjectRequirements {
  taskType: 'coding' | 'research' | 'creative' | 'analysis';
  complexity: 'simple' | 'medium' | 'complex';
  needsContext: boolean;
  budget: 'free' | 'low' | 'high';
}

function recommendTool(req: ProjectRequirements): ToolRecommendation {
  if (req.taskType === 'coding') {
    if (req.complexity === 'simple' && req.budget === 'free') {
      return {
        tool: "GitHub Copilot (free tier)",
        reason: "Fast autocomplete for simple coding tasks",
        alternatives: ["Tabnine", "Cody"]
      };
    }
    if (req.needsContext && req.complexity === 'complex') {
      return {
        tool: "Claude Code or Cursor",
        reason: "Large context window for complex codebases",
        alternatives: ["Aider", "GPT-4 with long context"]
      };
    }
    return {
      tool: "GitHub Copilot",
      reason: "Best general-purpose coding assistant",
      alternatives: ["Claude Code", "Cursor"]
    };
  }
  if (req.taskType === 'research') {
    return {
      tool: "ChatGPT with browsing or Claude",
      reason: "Strong reasoning and research capabilities",
      alternatives: ["Perplexity AI", "Bing Chat"]
    };
  }
  if (req.taskType === 'creative') {
    return {
      tool: "Claude or GPT-4",
      reason: "Excellent creative writing and ideation",
      alternatives: ["Gemini", "Cohere"]
    };
  }
  return {
    tool: "ChatGPT",
    reason: "Versatile general-purpose AI",
    alternatives: ["Claude", "Gemini"]
  };
}

const scenarios: ProjectRequirements[] = [
  { taskType: 'coding', complexity: 'simple', needsContext: false, budget: 'free' },
  { taskType: 'coding', complexity: 'complex', needsContext: true, budget: 'high' },
  { taskType: 'research', complexity: 'medium', needsContext: true, budget: 'low' }
];

console.log("=== AI Tool Recommendations ===\\n");
scenarios.forEach((scenario, i) => {
  const rec = recommendTool(scenario);
  console.log(\`Scenario \${i + 1}:\`);
  console.log(\`  Task: \${scenario.taskType}\`);
  console.log(\`  Complexity: \${scenario.complexity}\`);
  console.log(\`  Needs Context: \${scenario.needsContext}\`);
  console.log(\`  Budget: \${scenario.budget}\`);
  console.log(\`\\n  ✓ Recommended: \${rec.tool}\`);
  console.log(\`    Reason: \${rec.reason}\`);
  console.log(\`    Alternatives: \${rec.alternatives.join(", ")}\\n\`);
});
`,
    }
  },

  // Chapter 7: Prompt Engineering
  promptComparison: {
    title: "Prompt Quality Comparison",
    template: "vanilla-ts" as const,
    files: {
      "/index.ts": `// Prompt Quality Analyzer
interface Prompt {
  text: string;
  hasContext: boolean;
  hasConstraints: boolean;
  hasExamples: boolean;
  specificity: 'vague' | 'moderate' | 'precise';
}

function scorePrompt(prompt: Prompt): {
  score: number;
  strengths: string[];
  improvements: string[];
} {
  let score = 50;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (prompt.hasContext) {
    score += 15;
    strengths.push("Provides context");
  } else {
    improvements.push("Add context about your use case");
  }

  if (prompt.hasConstraints) {
    score += 15;
    strengths.push("Defines constraints");
  } else {
    improvements.push("Specify constraints and requirements");
  }

  if (prompt.hasExamples) {
    score += 10;
    strengths.push("Includes examples");
  } else {
    improvements.push("Provide examples for clarity");
  }

  if (prompt.specificity === 'precise') {
    score += 10;
    strengths.push("Very specific and clear");
  } else if (prompt.specificity === 'moderate') {
    score += 5;
    improvements.push("Be more specific");
  } else {
    improvements.push("Too vague - add specific details");
  }

  return { score, strengths, improvements };
}

const badPrompt: Prompt = {
  text: "Write me a function",
  hasContext: false,
  hasConstraints: false,
  hasExamples: false,
  specificity: 'vague'
};

const goodPrompt: Prompt = {
  text: "Create a TypeScript function to validate email addresses using regex, with proper error messages",
  hasContext: true,
  hasConstraints: true,
  hasExamples: false,
  specificity: 'precise'
};

const excellentPrompt: Prompt = {
  text: "Create a TypeScript function that validates emails, handles edge cases, includes unit tests, and returns detailed error messages",
  hasContext: true,
  hasConstraints: true,
  hasExamples: true,
  specificity: 'precise'
};

console.log("=== Prompt Quality Analysis ===\\n");
[
  { label: "❌ Bad Prompt", prompt: badPrompt },
  { label: "✓ Good Prompt", prompt: goodPrompt },
  { label: "✓✓ Excellent Prompt", prompt: excellentPrompt }
].forEach(({ label, prompt }) => {
  const result = scorePrompt(prompt);
  console.log(\`\${label}:\`);
  console.log(\`  Score: \${result.score}/100\`);
  console.log(\`  Text: "\${prompt.text}"\`);
  if (result.strengths.length > 0) {
    console.log(\`  Strengths:\`);
    result.strengths.forEach(s => console.log(\`    + \${s}\`));
  }
  if (result.improvements.length > 0) {
    console.log(\`  Improvements:\`);
    result.improvements.forEach(i => console.log(\`    - \${i}\`));
  }
  console.log("");
});
`,
    }
  }
};
