import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import styles from './styles.module.css';

interface InteractiveDiagramProps {
  title?: string;
  diagram: string;
  caption?: string;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
});

export default function InteractiveDiagram({
  title,
  diagram,
  caption
}: InteractiveDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render the diagram
        const { svg } = await mermaid.render(id, diagram);

        // Insert the SVG
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <div className={styles.diagramContainer}>
      {title && (
        <div className={styles.header}>
          <h3>📊 {title}</h3>
        </div>
      )}

      <div className={styles.diagramWrapper}>
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Rendering diagram...</span>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <div
          ref={diagramRef}
          className={styles.diagram}
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />
      </div>

      {caption && (
        <div className={styles.caption}>
          {caption}
        </div>
      )}
    </div>
  );
}

// Pre-made diagrams for chapters
export const Diagrams = {
  ragArchitecture: `graph TB
    User[👤 User Query] --> Embedding[🔢 Generate Embedding]
    Embedding --> VectorDB[(🗄️ Vector Database<br/>Search Similar)]
    VectorDB --> Context[📄 Retrieved Context]
    Context --> LLM[🤖 LLM Generation]
    User --> LLM
    LLM --> Response[✅ Final Answer]

    style User fill:#ff4757,stroke:#2f3542,stroke-width:3px
    style Embedding fill:#ffa502,stroke:#2f3542,stroke-width:3px
    style VectorDB fill:#00d2d3,stroke:#2f3542,stroke-width:3px
    style Context fill:#ffd700,stroke:#2f3542,stroke-width:3px
    style LLM fill:#5352ed,stroke:#2f3542,stroke-width:3px
    style Response fill:#2ed573,stroke:#2f3542,stroke-width:3px`,

  ragWorkflow: `sequenceDiagram
    participant U as User
    participant A as Application
    participant V as Vector DB
    participant L as LLM

    U->>A: "What is RAG?"
    A->>A: Convert query to embedding
    A->>V: Search similar vectors
    V-->>A: Top K relevant docs
    A->>L: Prompt + Context
    L-->>A: Generated answer
    A-->>U: Final response with sources`,

  vectorEmbedding: `graph LR
    Text[📝 Text Input] --> Model[🧠 Embedding Model]
    Model --> Vector[🔢 Vector<br/>[0.5, 0.2, ...]]
    Vector --> VDB[(🗄️ Vector DB)]

    Query[❓ Query Text] --> QModel[🧠 Embedding Model]
    QModel --> QVector[🔢 Query Vector]
    QVector --> Search{🔍 Similarity Search}
    VDB --> Search
    Search --> Results[📄 Top Results]

    style Text fill:#ff4757,stroke:#2f3542,stroke-width:3px
    style Model fill:#ffa502,stroke:#2f3542,stroke-width:3px
    style Vector fill:#ffd700,stroke:#2f3542,stroke-width:3px
    style VDB fill:#00d2d3,stroke:#2f3542,stroke-width:3px
    style Query fill:#5352ed,stroke:#2f3542,stroke-width:3px
    style QModel fill:#ff6348,stroke:#2f3542,stroke-width:3px
    style QVector fill:#a29bfe,stroke:#2f3542,stroke-width:3px
    style Search fill:#1e90ff,stroke:#2f3542,stroke-width:3px
    style Results fill:#2ed573,stroke:#2f3542,stroke-width:3px`,

  aiDevelopmentWorkflow: `graph TD
    Start[📋 Define Requirements] --> Spec[📝 Write Specification]
    Spec --> AI[🤖 AI Generates Code]
    AI --> Review{👀 Review Code}
    Review -->|Issues| Refine[🔧 Refine Prompt]
    Refine --> AI
    Review -->|Good| Test[✅ Test Code]
    Test -->|Fails| Debug[🐛 Debug & Fix]
    Debug --> AI
    Test -->|Passes| Deploy[🚀 Deploy]

    style Start fill:#ff4757,stroke:#2f3542,stroke-width:3px
    style Spec fill:#ffa502,stroke:#2f3542,stroke-width:3px
    style AI fill:#ffd700,stroke:#2f3542,stroke-width:3px
    style Review fill:#00d2d3,stroke:#2f3542,stroke-width:3px
    style Refine fill:#ff6348,stroke:#2f3542,stroke-width:3px
    style Test fill:#2ed573,stroke:#2f3542,stroke-width:3px
    style Debug fill:#ff7675,stroke:#2f3542,stroke-width:3px
    style Deploy fill:#00b894,stroke:#2f3542,stroke-width:3px`,

  specDriven: `graph TB
    subgraph Planning
        Req[Requirements] --> Spec[Detailed Spec]
        Spec --> Review[Spec Review]
    end

    subgraph Development
        Review --> Code[AI Code Gen]
        Code --> Impl[Implementation]
    end

    subgraph Validation
        Impl --> Test[Automated Tests]
        Test --> Valid{Meets Spec?}
        Valid -->|No| Refine[Refine Code]
        Refine --> Code
        Valid -->|Yes| Done[✅ Complete]
    end

    style Req fill:#ff4757,stroke:#2f3542,stroke-width:3px
    style Spec fill:#ffa502,stroke:#2f3542,stroke-width:3px
    style Review fill:#ffd700,stroke:#2f3542,stroke-width:3px
    style Code fill:#00d2d3,stroke:#2f3542,stroke-width:3px
    style Impl fill:#5352ed,stroke:#2f3542,stroke-width:3px
    style Test fill:#ff6348,stroke:#2f3542,stroke-width:3px
    style Valid fill:#a29bfe,stroke:#2f3542,stroke-width:3px
    style Refine fill:#fd79a8,stroke:#2f3542,stroke-width:3px
    style Done fill:#2ed573,stroke:#2f3542,stroke-width:3px`,

  documentIngestion: `graph LR
    Docs[📚 Documents] --> Split[✂️ Chunk & Split]
    Split --> Embed[🔢 Generate Embeddings]
    Embed --> Store[(🗄️ Store in Vector DB)]

    Store --> Ready[✅ Ready for Search]

    style Docs fill:#ff4757,stroke:#2f3542,stroke-width:3px
    style Split fill:#ffa502,stroke:#2f3542,stroke-width:3px
    style Embed fill:#ffd700,stroke:#2f3542,stroke-width:3px
    style Store fill:#00d2d3,stroke:#2f3542,stroke-width:3px
    style Ready fill:#2ed573,stroke:#2f3542,stroke-width:3px`
};
