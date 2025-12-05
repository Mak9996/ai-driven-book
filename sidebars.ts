import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'preface',
      label: '📘 Preface: Welcome to AI-Native Era',
    },
    {
      type: 'doc',
      id: 'intro',
      label: '🚀 Introduction',
    },
    {
      type: 'category',
      label: '📚 Part 1: Foundations',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'chapters/01-foundations',
          label: 'Chapter 1: LLM Foundations',
        },
        {
          type: 'doc',
          id: 'chapters/ai-driven-intro',
          label: 'Chapter 2: AI-Driven Development Intro',
        },
      ],
    },
    {
      type: 'category',
      label: '🛠️ Part 2: Tools & Methodology',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'chapters/ai-tool-landscape',
          label: 'Chapter 3: AI Tool Landscape',
        },
        {
          type: 'doc',
          id: 'chapters/markdown-prompting',
          label: 'Chapter 4: Markdown & Prompt Engineering',
        },
        {
          type: 'doc',
          id: 'chapters/sdd-fundamentals',
          label: 'Chapter 5: Specification-Driven Development',
        },
      ],
    },
    {
      type: 'category',
      label: '💻 Part 3: Implementation',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'chapters/spec-driven',
          label: 'Chapter 6: Spec-Driven Methodology',
        },
        {
          type: 'doc',
          id: 'chapters/03-rag-chatbots',
          label: 'Chapter 7: RAG Chatbots',
        },
        {
          type: 'doc',
          id: 'chapters/implementation',
          label: 'Chapter 8: Implementation Guide',
        },
      ],
    },
    {
      type: 'doc',
      id: 'resources',
      label: '📚 Resources',
    },
  ],
};

export default sidebars;
