import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function ReadingProgress(): JSX.Element {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(scrollPercentage, 100));
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className={styles.progressBar}
      style={{ width: `${progress}%` }}
      aria-label={`Reading progress: ${Math.round(progress)}%`}
    />
  );
}
