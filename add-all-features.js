const fs = require('fs');
const path = require('path');

const features = {
  'docs/00-preface.md': {
    imports: `import InteractiveDiagram from '@site/src/components/InteractiveDiagram';`,
    content: `

## 🌟 AI-Driven Development Journey

<InteractiveDiagram
  title="The AI-Native Era Transformation"
  diagram={\`graph LR
    Traditional[📝 Traditional Dev] --> AI[🤖 AI-Assisted Dev]
    AI --> Future[🚀 AI-Native Era]

    Traditional --> T1[Manual Coding]
    Traditional --> T2[Limited Automation]

    AI --> A1[AI Suggestions]
    AI --> A2[Code Completion]

    Future --> F1[AI Collaboration]
    Future --> F2[Intelligent Automation]
    Future --> F3[Continuous Learning]

    style Traditional fill:#9CA3AF,stroke:#6B7280,stroke-width:2px,color:#fff
    style AI fill:#667eea,stroke:#764ba2,stroke-width:2px,color:#fff
    style Future fill:#f093fb,stroke:#f5576c,stroke-width:2px,color:#fff\`}
  caption="The evolution of software development from traditional methods to the AI-Native era."
/>
`
  },

  'docs/chapters/01-foundations.md': {
    imports: `import InteractiveDiagram from '@site/src/components/InteractiveDiagram';
import CodePlayground from '@site/src/components/CodePlayground';`,
    content: `

## 🧠 LLM Foundations

<InteractiveDiagram
  title="How LLMs Work"
  diagram={\`graph TD
    Input[📝 Text Input] --> Tokenize[🔤 Tokenization]
    Tokenize --> Embed[🔢 Embeddings]
    Embed --> Transform[🧠 Transformer Layers]
    Transform --> Predict[🎯 Next Token Prediction]
    Predict --> Output[📄 Generated Text]

    style Input fill:#667eea,stroke:#764ba2,stroke-width:2px,color:#fff
    style Transform fill:#f093fb,stroke:#f5576c,stroke-width:2px,color:#fff
    style Output fill:#43e97b,stroke:#38f9d7,stroke-width:2px,color:#000\`}
  caption="The process of how Large Language Models generate text."
/>

<CodePlayground
  title="Understanding Tokens and Context"
  template="vanilla-ts"
  files={{
    "/index.ts": \`// Understanding LLM Tokens and Context

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
\`
  }}
  editorHeight="500px"
/>
`
  },

  'docs/chapters/02-spec-driven.md': {
    imports: `import InteractiveDiagram, { Diagrams } from '@site/src/components/InteractiveDiagram';
import CodePlayground from '@site/src/components/CodePlayground';`,
    content: `

## 📋 Spec-Driven Development Process

<InteractiveDiagram
  title="Spec-Driven Development Workflow"
  diagram={Diagrams.specDriven}
  caption="The complete workflow of Spec-Driven Development from requirements to validation."
/>

<CodePlayground
  title="Writing Effective Specifications"
  template="vanilla-ts"
  files={{
    "/index.ts": \`// Spec-Driven Development Example

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

// Example: User Authentication Spec
const authSpec: Specification = {
  goal: "Implement secure user authentication system",

  requirements: [
    "Users can register with email and password",
    "Password must be hashed before storage",
    "JWT tokens for session management",
    "Token expiration after 24 hours",
    "Password reset functionality"
  ],

  constraints: [
    "Password minimum 8 characters",
    "Must include uppercase, lowercase, number",
    "Rate limiting: 5 login attempts per minute",
    "HTTPS only for all auth endpoints"
  ],

  acceptanceCriteria: [
    "User can successfully register with valid credentials",
    "Invalid credentials return appropriate error",
    "JWT token is returned upon successful login",
    "Expired tokens are rejected",
    "Password is never stored in plain text"
  ],

  examples: [
    {
      input: { email: "user@example.com", password: "SecurePass123" },
      expectedOutput: { success: true, token: "jwt_token_here" },
      description: "Valid registration"
    },
    {
      input: { email: "user@example.com", password: "weak" },
      expectedOutput: { success: false, error: "Password too weak" },
      description: "Password validation failure"
    }
  ]
};

// Validate spec completeness
function validateSpec(spec: Specification): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!spec.goal) issues.push("Missing goal");
  if (spec.requirements.length === 0) issues.push("No requirements defined");
  if (spec.acceptanceCriteria.length === 0) issues.push("No acceptance criteria");
  if (spec.examples.length === 0) issues.push("No examples provided");

  return {
    valid: issues.length === 0,
    issues
  };
}

// Test the spec
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
\`
  }}
  editorHeight="600px"
/>
`
  },

  'docs/chapters/04-implementation.md': {
    imports: `import InteractiveDiagram from '@site/src/components/InteractiveDiagram';
import CodePlayground from '@site/src/components/CodePlayground';`,
    content: `

## 🛠️ Implementation Workflow

<InteractiveDiagram
  title="AI-Assisted Implementation Process"
  diagram={\`graph TD
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

    style Spec fill:#667eea,stroke:#764ba2,stroke-width:2px,color:#fff
    style AI fill:#f093fb,stroke:#f5576c,stroke-width:2px,color:#fff
    style Test fill:#43e97b,stroke:#38f9d7,stroke-width:2px,color:#000
    style Deploy fill:#30cfd0,stroke:#330867,stroke-width:2px,color:#fff\`}
  caption="Step-by-step implementation process with AI assistance."
/>

<CodePlayground
  title="Testing AI-Generated Code"
  template="vanilla-ts"
  files={{
    "/index.ts": \`// Testing AI-Generated Code

// AI-generated function (simulated)
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

// Test suite
interface TestCase {
  input: string;
  expected: boolean;
  description: string;
}

const testCases: TestCase[] = [
  { input: "user@example.com", expected: true, description: "Valid email" },
  { input: "invalid.email", expected: false, description: "Missing @" },
  { input: "@example.com", expected: false, description: "Missing local part" },
  { input: "user@", expected: false, description: "Missing domain" },
  { input: "user@domain", expected: false, description: "Missing TLD" },
  { input: "user name@example.com", expected: false, description: "Space in email" },
  { input: "", expected: false, description: "Empty string" }
];

// Run tests
function runTests(testCases: TestCase[]): {
  passed: number;
  failed: number;
  failures: string[];
} {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  testCases.forEach((test, i) => {
    const result = validateEmail(test.input);
    if (result === test.expected) {
      passed++;
      console.log(\`✅ Test \${i + 1}: \${test.description}\`);
    } else {
      failed++;
      failures.push(\`Test \${i + 1}: \${test.description}\`);
      console.log(\`❌ Test \${i + 1}: \${test.description}\`);
      console.log(\`   Expected: \${test.expected}, Got: \${result}\`);
    }
  });

  return { passed, failed, failures };
}

// Execute tests
console.log("=== Running Test Suite ===\\n");
const results = runTests(testCases);

console.log(\`\\n=== Test Results ===\`);
console.log(\`Passed: \${results.passed}/\${testCases.length}\`);
console.log(\`Failed: \${results.failed}/\${testCases.length}\`);
console.log(\`Success Rate: \${Math.round((results.passed / testCases.length) * 100)}%\`);
\`
  }}
  editorHeight="550px"
/>
`
  },

  'docs/chapters/05-ai-driven-intro.md': {
    imports: `import InteractiveDiagram, { Diagrams } from '@site/src/components/InteractiveDiagram';
import CodePlayground, { Examples } from '@site/src/components/CodePlayground';`,
    content: `

## 🚀 AI-Driven Development Workflow

<InteractiveDiagram
  title="Complete AI-Driven Development Cycle"
  diagram={Diagrams.aiDevelopmentWorkflow}
  caption="The iterative cycle of AI-driven development from requirements to deployment."
/>

<CodePlayground
  title={Examples.promptEngineering.title}
  template={Examples.promptEngineering.template}
  files={Examples.promptEngineering.files}
  editorHeight="500px"
/>
`
  }
};

// Apply features to each chapter
Object.entries(features).forEach(([file, { imports, content }]) => {
  const filePath = path.join(__dirname, file);
  let fileContent = fs.readFileSync(filePath, 'utf8');

  // Add imports at the top (after frontmatter)
  if (!fileContent.includes(imports)) {
    const lines = fileContent.split('\\n');
    const frontmatterEnd = lines.findIndex((line, i) => i > 0 && line === '---');
    if (frontmatterEnd > 0) {
      lines.splice(frontmatterEnd + 1, 0, '', imports, '');
      fileContent = lines.join('\\n');
    }
  }

  // Add content before flashcards section
  if (!fileContent.includes('## 🌟') && !fileContent.includes('## 🧠') &&
      !fileContent.includes('## 📋') && !fileContent.includes('## 🛠️') &&
      !fileContent.includes('## 🚀')) {
    const flashcardsIndex = fileContent.indexOf('## 🎴 Test Your Knowledge');
    if (flashcardsIndex > 0) {
      fileContent = fileContent.slice(0, flashcardsIndex) + content + '\\n' + fileContent.slice(flashcardsIndex);
    }
  }

  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`✅ Added features to ${file}`);
});

console.log('\\n🎉 All features added to all chapters!');
