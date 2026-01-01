import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export const TypewriterText = ({ 
  text, 
  speed = 50, 
  delay = 0,
  className = '',
  onComplete,
  showCursor = true
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, hasStarted, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
};

interface CinematicTextProps {
  lines: string[];
  className?: string;
  lineDelay?: number;
  onComplete?: () => void;
}

export const CinematicText = ({ 
  lines, 
  className = '',
  lineDelay = 800,
  onComplete
}: CinematicTextProps) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    lines.forEach((_, index) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
        if (index === lines.length - 1) {
          setTimeout(() => onComplete?.(), 1000);
        }
      }, index * lineDelay);
    });
  }, [lines, lineDelay, onComplete]);

  return (
    <div className={`space-y-4 ${className}`}>
      {lines.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={visibleLines.includes(index) ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {visibleLines.includes(index) && (
            <TypewriterText 
              text={line} 
              speed={40} 
              showCursor={index === visibleLines[visibleLines.length - 1]}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};
