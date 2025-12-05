import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface Source {
  text: string;
  score: number;
  source?: string;
}

interface APIConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
  model?: string;
}

type FeatureMode = 'chat' | 'summary' | 'compare' | 'roadmap' | 'code';

export default function Chatbot(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig | null>(null);
  const [featureMode, setFeatureMode] = useState<FeatureMode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiApiConfig');
    if (saved) {
      try {
        setApiConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading API config:', e);
      }
    }
  }, []);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          role: 'assistant',
          content: apiConfig
            ? 'Hi! I\'m your AI assistant for this book. Ask me anything about AI-driven development, or try the smart features below!'
            : '👋 Welcome! To get started, please configure your API key by clicking the ⚙️ Settings button above.'
        }]);
      }, 1000);
    }
  }, [apiConfig]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 10) {
        setSelectedText(text);
        // Don't auto-open, just store the selection
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // Save API config
  const saveApiConfig = (provider: 'openai' | 'gemini', apiKey: string, model?: string) => {
    const config = { provider, apiKey, model };
    setApiConfig(config);
    localStorage.setItem('aiApiConfig', JSON.stringify(config));
    setShowSettings(false);
    const modelName = model || (provider === 'openai' ? 'OpenAI' : 'Google Gemini');
    setMessages([{
      role: 'assistant',
      content: `Great! You're all set with ${modelName}. Ask me anything about the book!`
    }]);
  };

  // Clear API config
  const clearApiConfig = () => {
    setApiConfig(null);
    localStorage.removeItem('aiApiConfig');
    setMessages([]);
    setShowSettings(false);
  };

  // Get book context based on query
  const getBookContext = (query: string): string => {
    const keywords = query.toLowerCase();
    let context = '';

    // Smart context selection based on keywords
    if (keywords.includes('rag') || keywords.includes('retrieval')) {
      context += '\n\n=== Chapter 3: RAG Chatbots ===\nRAG (Retrieval-Augmented Generation) combines vector search with LLM generation to provide accurate, context-aware responses based on your specific documents.';
    }
    if (keywords.includes('spec') || keywords.includes('specification')) {
      context += '\n\n=== Chapter 2: Spec-Driven Development ===\nSpec-Driven Development emphasizes creating clear specifications before implementation, ensuring alignment between requirements and code.';
    }
    if (keywords.includes('vector') || keywords.includes('embedding')) {
      context += '\n\n=== Vectors & Embeddings ===\nVector embeddings are numerical representations of text that capture semantic meaning, enabling similarity search and semantic retrieval.';
    }
    if (keywords.includes('ai-driven') || keywords.includes('foundation')) {
      context += '\n\n=== Chapter 1: Foundations ===\nAI-driven development leverages artificial intelligence to assist in coding, testing, and architecture decisions.';
    }
    if (keywords.includes('markdown') || keywords.includes('prompt')) {
      context += '\n\n=== Chapter 7: Markdown Prompting ===\nMarkdown-based prompting provides structured, clear instructions to AI models for better results.';
    }
    if (keywords.includes('implement') || keywords.includes('build')) {
      context += '\n\n=== Chapter 4: Implementation ===\nPractical implementation strategies for building AI-powered applications and integrating AI tools into development workflows.';
    }

    return context || '\n\nThis question is about AI-Driven Development concepts covered in the book.';
  };

  // Call backend API (works with both OpenAI and Gemini)
  const callBackendAPI = async (prompt: string): Promise<string> => {
    const response = await fetch('http://localhost:8000/api/simple-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        provider: apiConfig?.provider,
        api_key: apiConfig?.apiKey,
        model: apiConfig?.model,
        context: selectedText || undefined
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Backend API error');
    }

    const data = await response.json();
    return data.response;
  };

  // Feature: Interactive Study Buddy
  const studyBuddyPrompt = (text: string, action: 'explain' | 'example' | 'simplify'): string => {
    const prompts = {
      explain: `Explain this concept in detail:\n\n"${text}"\n\nProvide a clear, thorough explanation.`,
      example: `Give 2-3 real-world examples of this concept:\n\n"${text}"\n\nMake the examples practical and relevant.`,
      simplify: `Explain this concept as if I'm a beginner:\n\n"${text}"\n\nUse simple language and analogies.`
    };
    return prompts[action];
  };

  // Feature: Chapter Summary
  const chapterSummaryPrompt = (chapterNum: number): string => {
    const chapters = [
      'Preface: Introduction to AI-Driven Development',
      'Chapter 1: Foundations of AI-Driven Development',
      'Chapter 2: Spec-Driven Development',
      'Chapter 3: RAG Chatbots',
      'Chapter 4: Implementation Strategies',
      'Chapter 5: AI-Driven Development Introduction',
      'Chapter 6: AI Tool Landscape',
      'Chapter 7: Markdown Prompting',
      'Chapter 8: SDD Fundamentals'
    ];
    return `Summarize ${chapters[chapterNum]} in 3-5 bullet points. Focus on key concepts, main takeaways, and practical applications.`;
  };

  // Feature: Compare & Connect
  const comparePrompt = (concept1: string, concept2: string): string => {
    return `Compare and contrast ${concept1} and ${concept2} based on the AI-Driven Development book. Explain:\n1. How they're similar\n2. How they differ\n3. How they work together\n4. When to use each`;
  };

  // Feature: Roadmap Generator
  const roadmapPrompt = (goal: string, level: string): string => {
    return `I'm a ${level} developer and I want to ${goal}. Based on the AI-Driven Development book chapters, create a personalized learning roadmap:\n1. Which chapters should I read first?\n2. In what order?\n3. What should I focus on?\n4. Any prerequisites?\n\nFormat as a numbered step-by-step plan.`;
  };

  // Main send message function
  const sendMessage = async (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim()) return;

    if (!apiConfig) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Please configure your API key first! Click the ⚙️ Settings button above.'
      }]);
      return;
    }

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build prompt with context
      let finalPrompt = messageText;

      if (featureMode === 'chat' && !customPrompt) {
        const context = getBookContext(messageText);
        finalPrompt = selectedText
          ? `Context from book: "${selectedText}"\n\nUser question: ${messageText}`
          : `${context}\n\nUser question: ${messageText}`;
      }

      // Call backend API (handles both OpenAI and Gemini)
      const response = await callBackendAPI(finalPrompt);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSelectedText('');
      setFeatureMode('chat');
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${error.message || 'Failed to get response'}. Please check your API key and try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Message copied!');
  };

  const exportChat = () => {
    const chatText = messages.map(msg =>
      `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Smart feature actions
  const handleSmartAction = (action: string) => {
    if (!selectedText && (action === 'explain' || action === 'example' || action === 'simplify')) {
      alert('Please select some text first!');
      return;
    }

    let prompt = '';
    switch (action) {
      case 'explain':
        prompt = studyBuddyPrompt(selectedText, 'explain');
        break;
      case 'example':
        prompt = studyBuddyPrompt(selectedText, 'example');
        break;
      case 'simplify':
        prompt = studyBuddyPrompt(selectedText, 'simplify');
        break;
    }

    if (prompt) {
      sendMessage(prompt);
    }
  };

  const quickQuestions = [
    { text: "What is AI-driven development?", mode: 'chat' as FeatureMode },
    { text: "How do I build a RAG chatbot?", mode: 'chat' as FeatureMode },
    { text: "What is spec-driven development?", mode: 'chat' as FeatureMode },
    { text: "Explain vector databases", mode: 'chat' as FeatureMode }
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <>
      {!isOpen && (
        <button
          className={styles.toggleButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className={styles.chatbot}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={apiConfig ? styles.statusDot : styles.statusDotInactive}></div>
              <h3>AI Book Assistant</h3>
              {apiConfig && (
                <span className={styles.providerBadge}>
                  {apiConfig.provider === 'openai' ? '🤖 OpenAI' : '✨ Gemini'}
                </span>
              )}
            </div>
            <div className={styles.headerButtons}>
              <button
                className={styles.headerButton}
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                ⚙️
              </button>
              <button
                className={styles.headerButton}
                onClick={exportChat}
                title="Export chat"
                disabled={messages.length <= 1}
              >
                📥
              </button>
              <button
                className={styles.headerButton}
                onClick={clearChat}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                className={styles.headerButton}
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? '□' : '_'}
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && !isMinimized && (
            <div className={styles.settingsPanel}>
              <h4>⚙️ API Configuration</h4>
              <p className={styles.settingsInfo}>
                Configure your AI provider. Your API key is stored locally in your browser and never sent to our servers.
              </p>

              <APIConfigForm
                currentConfig={apiConfig}
                onSave={saveApiConfig}
                onClear={clearApiConfig}
              />
            </div>
          )}

          {/* Context banner */}
          {selectedText && !isMinimized && (
            <div className={styles.contextBanner}>
              <div className={styles.contextText}>
                Selected: "{selectedText.substring(0, 50)}..."
              </div>
              <div className={styles.contextActions}>
                <button
                  className={styles.contextActionBtn}
                  onClick={() => handleSmartAction('explain')}
                  title="Explain this"
                >
                  📖 Explain
                </button>
                <button
                  className={styles.contextActionBtn}
                  onClick={() => handleSmartAction('example')}
                  title="Give examples"
                >
                  💡 Examples
                </button>
                <button
                  className={styles.contextActionBtn}
                  onClick={() => handleSmartAction('simplify')}
                  title="Simplify this"
                >
                  🎯 Simplify
                </button>
                <button
                  className={styles.clearContext}
                  onClick={() => setSelectedText('')}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {!isMinimized && (
            <div className={styles.messages}>
              {messages.length <= 1 && !showSettings && (
                <div className={styles.welcome}>
                  <h4>Welcome! 👋</h4>
                  {apiConfig ? (
                    <>
                      <p>Ask me anything about AI-Driven Development!</p>
                      <p className={styles.hint}>
                        💡 Tip: Select text on the page, then use quick actions to explain, get examples, or simplify!
                      </p>
                      <div className={styles.quickQuestions}>
                        <p className={styles.quickTitle}>Quick questions:</p>
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            className={styles.quickButton}
                            onClick={() => handleQuickQuestion(q.text)}
                          >
                            {q.text}
                          </button>
                        ))}
                      </div>

                      {/* Smart Features */}
                      <div className={styles.smartFeatures}>
                        <p className={styles.quickTitle}>Smart Features:</p>
                        <div className={styles.featureGrid}>
                          <button
                            className={styles.featureButton}
                            onClick={() => {
                              const chapter = prompt('Which chapter? (0-8, where 0=Preface)');
                              if (chapter !== null) {
                                const num = parseInt(chapter);
                                if (num >= 0 && num <= 8) {
                                  sendMessage(chapterSummaryPrompt(num));
                                }
                              }
                            }}
                          >
                            📚 Summarize Chapter
                          </button>
                          <button
                            className={styles.featureButton}
                            onClick={() => {
                              const concepts = prompt('Enter two concepts to compare (e.g., "RAG, traditional search")');
                              if (concepts) {
                                const [c1, c2] = concepts.split(',').map(s => s.trim());
                                if (c1 && c2) {
                                  sendMessage(comparePrompt(c1, c2));
                                }
                              }
                            }}
                          >
                            🔄 Compare Concepts
                          </button>
                          <button
                            className={styles.featureButton}
                            onClick={() => {
                              const goal = prompt('What do you want to build? (e.g., "build a RAG chatbot")');
                              const level = prompt('Your level? (beginner/intermediate/advanced)');
                              if (goal && level) {
                                sendMessage(roadmapPrompt(goal, level));
                              }
                            }}
                          >
                            🗺️ Generate Roadmap
                          </button>
                          <button
                            className={styles.featureButton}
                            onClick={() => {
                              const code = prompt('What code do you want help with?');
                              if (code) {
                                sendMessage(`Explain this code and provide improvements:\n\n${code}`);
                              }
                            }}
                          >
                            💻 Code Helper
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className={styles.setupPrompt}>
                      👆 Click the ⚙️ Settings button above to configure your API key and get started!
                    </p>
                  )}
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                  <div className={styles.messageHeader}>
                    <div className={styles.messageRole}>
                      {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                    </div>
                    <button
                      className={styles.copyButton}
                      onClick={() => copyMessage(msg.content)}
                      title="Copy message"
                    >
                      📋
                    </button>
                  </div>
                  <div className={styles.content}>{msg.content}</div>
                </div>
              ))}

              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.loading}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {!isMinimized && (
            <div className={styles.inputArea}>
              <textarea
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  !apiConfig
                    ? "Configure API key first..."
                    : selectedText
                    ? "Ask about the selected text..."
                    : "Ask a question about the book..."
                }
                rows={2}
                disabled={!apiConfig}
              />
              <button
                className={styles.sendButton}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || !apiConfig}
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// API Configuration Form Component
function APIConfigForm({
  currentConfig,
  onSave,
  onClear
}: {
  currentConfig: APIConfig | null;
  onSave: (provider: 'openai' | 'gemini', apiKey: string, model?: string) => void;
  onClear: () => void;
}) {
  const [provider, setProvider] = useState<'openai' | 'gemini'>(currentConfig?.provider || 'openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');

  const openaiModels = [
    { value: 'gpt-4o', label: 'GPT-4o (Latest & Fastest)', description: 'Most advanced, multimodal' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Faster, cheaper GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: '128K context, vision' },
    { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model' },
    { value: 'o1-preview', label: 'o1-preview (Reasoning)', description: 'Advanced reasoning' },
    { value: 'o1-mini', label: 'o1-mini (Reasoning)', description: 'Fast reasoning model' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      const selectedModel = provider === 'openai' ? model : undefined;
      onSave(provider, apiKey.trim(), selectedModel);
      setApiKey('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.configForm}>
      {currentConfig && (
        <div className={styles.currentConfig}>
          <p>✅ Currently using: <strong>{currentConfig.model || (currentConfig.provider === 'openai' ? 'OpenAI' : 'Google Gemini')}</strong></p>
          <button type="button" onClick={onClear} className={styles.clearConfigBtn}>
            Change Provider/Model
          </button>
        </div>
      )}

      {!currentConfig && (
        <>
          <div className={styles.providerSelector}>
            <label>
              <input
                type="radio"
                value="openai"
                checked={provider === 'openai'}
                onChange={(e) => setProvider('openai')}
              />
              <span className={styles.providerOption}>
                <strong>🤖 OpenAI (Advanced Models)</strong>
                <small>GPT-4o, GPT-4-Turbo, o1</small>
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className={styles.getKeyLink}>
                  Get API Key →
                </a>
              </span>
            </label>

            <label>
              <input
                type="radio"
                value="gemini"
                checked={provider === 'gemini'}
                onChange={(e) => setProvider('gemini')}
              />
              <span className={styles.providerOption}>
                <strong>✨ Google Gemini</strong>
                <small>Free tier: 60 requests/min</small>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className={styles.getKeyLink}>
                  Get API Key →
                </a>
              </span>
            </label>
          </div>

          {provider === 'openai' && (
            <div className={styles.modelSelector}>
              <label htmlFor="model">Select Model:</label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={styles.modelSelect}
              >
                {openaiModels.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label} - {m.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.apiKeyInput}>
            <label htmlFor="apiKey">API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
              required
            />
          </div>

          <div className={styles.securityNote}>
            🔒 Your API key is stored locally in your browser and is never sent to our servers.
          </div>

          <button type="submit" className={styles.saveConfigBtn}>
            Save & Start Chatting
          </button>
        </>
      )}
    </form>
  );
}
