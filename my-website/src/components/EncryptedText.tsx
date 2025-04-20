// components/EncryptedText.tsx
import React, { useEffect, useState } from 'react';

const letters = '';
const numbers = '10';
const symbols = '';

interface EncryptedTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

const getRandomChar = (originalChar: string) => {
  if (originalChar === ' ') return ' ';
  return numbers[Math.floor(Math.random() * numbers.length)];
};

const EncryptedText: React.FC<EncryptedTextProps> = ({ text, speed = 50, delay = 0, className }) => {
  const [displayed, setDisplayed] = useState<string>(''.padStart(text.length, ' '));
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    timeout = setTimeout(() => {
      let iteration = 0;

      interval = setInterval(() => {
        let result = '';

        for (let i = 0; i < text.length; i++) {
          if (i < iteration) {
            result += text[i];
          } else {
            result += getRandomChar(text[i]);
          }
        }

        setDisplayed(result);

        if (iteration >= text.length) {
          clearInterval(interval);
          setCompleted(true);
        }

        iteration += 1;
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, delay]);

  return <span className={className}>{displayed}</span>;
};

export default EncryptedText;
