import { useState, useEffect, useRef } from 'react';

export const useHint = () => {
  const [hintLevel, setHintLevel] = useState(0);
  const lastInteractionRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current;
      if (elapsed > 4000) setHintLevel(3);
      else if (elapsed > 2500) setHintLevel(2);
      else if (elapsed > 1500) setHintLevel(1);
      else setHintLevel(0);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const resetHint = () => {
    lastInteractionRef.current = Date.now();
    setHintLevel(0);
  };

  return { hintLevel, resetHint };
};
