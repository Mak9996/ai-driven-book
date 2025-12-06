import React from 'react';
import styles from './styles.module.css';

export default function DeveloperFooter() {
  const technologies = [
    'Agentic AI', 'Robotic AI', 'Gen AI', 'Python', 'DevOps',
    'Ethical Hacking', 'Data Science', 'Machine Learning',
    'Kubernetes', 'MCP', 'Docker', 'Flutter'
  ];

  const achievements = [
    { icon: '🏆', title: 'HBL P@SHA Winner' },
    { icon: '🥇', title: 'Eastern Michigan University - 1st Prize' },
    { icon: '🎖️', title: 'NED University - D2D Program' },
    { icon: '👨‍🏫', title: 'Sr. Instructor' },
    { icon: '🎓', title: 'UTech Ambassador' },
    { icon: '🚀', title: 'NASA Ambassador' }
  ];

  return (
    <footer className={styles.developerFooter}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.developerInfo}>
            <div className={styles.imageWrapper}>
              <img
                src="/ai-driven-book/img/ibrahim-samad.jpg"
                alt="Ibrahim Samad"
                className={styles.developerImage}
              />
            </div>
            <div className={styles.details}>
              <h3 className={styles.title}>Developed By</h3>
              <h2 className={styles.name}>Ibrahim Samad</h2>
              <p className={styles.role}>Full-Stack Developer | AI Specialist | Educator</p>

              <div className={styles.achievements}>
                {achievements.map((achievement, index) => (
                  <div key={index} className={styles.achievement}>
                    <span className={styles.achievementIcon}>{achievement.icon}</span>
                    <span className={styles.achievementTitle}>{achievement.title}</span>
                  </div>
                ))}
              </div>

              <p className={styles.description}>
                Passionate about AI-driven development, robotics, and building innovative educational experiences.
              </p>

              <div className={styles.technologies}>
                <p className={styles.techLabel}>Expertise:</p>
                <div className={styles.techTags}>
                  {technologies.map((tech, index) => (
                    <span key={index} className={styles.techTag}>{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.copyright}>
            <p>&copy; {new Date().getFullYear()} Ibrahim Samad. All rights reserved.</p>
            <p className={styles.subtext}>Built with Docusaurus, React, and AI-powered tools</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
