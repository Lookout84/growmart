import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TopProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    // Start new progress bar on route change
    doneRef.current = false;
    setProgress(0);
    setVisible(true);

    // Quickly animate to 80%, then stall
    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(60), 200);
    const t3 = setTimeout(() => setProgress(80), 400);

    timerRef.current = { t1, t2, t3 };

    // Finish bar after a short delay (simulates page load)
    const done = setTimeout(() => {
      doneRef.current = true;
      setProgress(100);
      // Hide after transition completes
      setTimeout(() => setVisible(false), 300);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(done);
    };
  }, [location.pathname + location.search]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #16a34a, #4ade80)',
        transition: progress === 100 ? 'width 0.2s ease, opacity 0.2s ease' : 'width 0.3s ease',
        zIndex: 9999,
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 8px #16a34a88',
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
};

export default TopProgressBar;
