import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ReadingProgress from '../components/ReadingProgress';
import Chatbot from '../components/Chatbot';
import DeveloperFooter from '../components/DeveloperFooter';

export default function Root({ children }): JSX.Element {
  return (
    <>
      <ReadingProgress />
      {children}
      <DeveloperFooter />
      <BrowserOnly>
        {() => <Chatbot />}
      </BrowserOnly>
    </>
  );
}
