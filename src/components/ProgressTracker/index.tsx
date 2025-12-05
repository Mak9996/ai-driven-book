import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface ChapterProgress {
  id: string;
  title: string;
  visited: boolean;
  completed: boolean;
  timeSpent: number; // seconds
  lastVisited?: number; // timestamp
}

interface ProgressData {
  chapters: { [key: string]: ChapterProgress };
  totalTimeSpent: number;
  startedReading: number; // timestamp
}

const CHAPTERS = [
  { id: 'preface', title: 'Preface', path: '/docs/00-preface' },
  { id: 'ch1', title: 'Chapter 1: Foundations', path: '/docs/chapters/01-foundations' },
  { id: 'ch2', title: 'Chapter 2: Spec-Driven Development', path: '/docs/chapters/02-spec-driven' },
  { id: 'ch3', title: 'Chapter 3: RAG Chatbots', path: '/docs/chapters/03-rag-chatbots' },
  { id: 'ch4', title: 'Chapter 4: Implementation', path: '/docs/chapters/04-implementation' },
  { id: 'ch5', title: 'Chapter 5: AI-Driven Intro', path: '/docs/chapters/05-ai-driven-intro' },
  { id: 'ch6', title: 'Chapter 6: AI Tool Landscape', path: '/docs/chapters/06-ai-tool-landscape' },
  { id: 'ch7', title: 'Chapter 7: Markdown Prompting', path: '/docs/chapters/07-markdown-prompting' },
  { id: 'ch8', title: 'Chapter 8: SDD Fundamentals', path: '/docs/chapters/08-sdd-fundamentals' },
];

export function useProgressTracker(chapterId?: string) {
  const [progress, setProgress] = useState<ProgressData>(() => {
    const saved = localStorage.getItem('bookProgress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
    return {
      chapters: {},
      totalTimeSpent: 0,
      startedReading: Date.now()
    };
  });

  // Track time on current chapter
  useEffect(() => {
    if (!chapterId) return;

    const startTime = Date.now();
    let intervalId: NodeJS.Timeout;

    // Mark chapter as visited
    setProgress(prev => {
      const updated = { ...prev };
      if (!updated.chapters[chapterId]) {
        updated.chapters[chapterId] = {
          id: chapterId,
          title: CHAPTERS.find(c => c.id === chapterId)?.title || chapterId,
          visited: true,
          completed: false,
          timeSpent: 0
        };
      }
      updated.chapters[chapterId].visited = true;
      updated.chapters[chapterId].lastVisited = startTime;
      return updated;
    });

    // Update time every 10 seconds
    intervalId = setInterval(() => {
      setProgress(prev => {
        const updated = { ...prev };
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (updated.chapters[chapterId]) {
          updated.chapters[chapterId].timeSpent += 10;
        }
        updated.totalTimeSpent += 10;
        return updated;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [chapterId]);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem('bookProgress', JSON.stringify(progress));
  }, [progress]);

  const markAsCompleted = (id: string) => {
    setProgress(prev => {
      const updated = { ...prev };
      if (updated.chapters[id]) {
        updated.chapters[id].completed = true;
      }
      return updated;
    });
  };

  const resetProgress = () => {
    if (confirm('Reset all reading progress? This cannot be undone.')) {
      const fresh: ProgressData = {
        chapters: {},
        totalTimeSpent: 0,
        startedReading: Date.now()
      };
      setProgress(fresh);
      localStorage.setItem('bookProgress', JSON.stringify(fresh));
    }
  };

  const getCompletionPercentage = () => {
    const total = CHAPTERS.length;
    const completed = Object.values(progress.chapters).filter(c => c.completed).length;
    return Math.round((completed / total) * 100);
  };

  const getVisitedCount = () => {
    return Object.values(progress.chapters).filter(c => c.visited).length;
  };

  return {
    progress,
    markAsCompleted,
    resetProgress,
    getCompletionPercentage,
    getVisitedCount
  };
}

export default function ProgressTracker({ minimal = false }: { minimal?: boolean }) {
  const { progress, resetProgress, getCompletionPercentage, getVisitedCount } = useProgressTracker();
  const [isExpanded, setIsExpanded] = useState(false);

  const completionPercentage = getCompletionPercentage();
  const visitedCount = getVisitedCount();
  const totalChapters = CHAPTERS.length;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (minimal) {
    return (
      <div className={styles.progressMinimal}>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <span className={styles.progressText}>
          {visitedCount}/{totalChapters} chapters • {completionPercentage}% complete
        </span>
      </div>
    );
  }

  return (
    <div className={styles.progressTracker}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>📚</span>
          <h3>Your Progress</h3>
        </div>
        <button className={styles.toggleBtn}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className={styles.summary}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{completionPercentage}%</div>
          <div className={styles.statLabel}>Complete</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{visitedCount}/{totalChapters}</div>
          <div className={styles.statLabel}>Chapters</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{formatTime(progress.totalTimeSpent)}</div>
          <div className={styles.statLabel}>Reading Time</div>
        </div>
      </div>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar} style={{ width: `${completionPercentage}%` }}></div>
      </div>

      {isExpanded && (
        <div className={styles.chapterList}>
          <h4>Chapter Progress</h4>
          {CHAPTERS.map(chapter => {
            const chapterProgress = progress.chapters[chapter.id];
            const isCompleted = chapterProgress?.completed;
            const isVisited = chapterProgress?.visited;
            const timeSpent = chapterProgress?.timeSpent || 0;

            return (
              <div key={chapter.id} className={styles.chapterItem}>
                <div className={styles.chapterStatus}>
                  {isCompleted ? '✅' : isVisited ? '👁️' : '⭕'}
                </div>
                <div className={styles.chapterInfo}>
                  <div className={styles.chapterTitle}>{chapter.title}</div>
                  {timeSpent > 0 && (
                    <div className={styles.chapterTime}>{formatTime(timeSpent)}</div>
                  )}
                </div>
              </div>
            );
          })}

          <button onClick={resetProgress} className={styles.resetBtn}>
            Reset Progress
          </button>
        </div>
      )}
    </div>
  );
}
