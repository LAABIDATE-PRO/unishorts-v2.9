import { useState, useEffect } from 'react';

export const useAdBlockDetector = () => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);

  useEffect(() => {
    const checkAdBlocker = async () => {
      try {
        // The bait script in the public folder
        await fetch('/ads.js');
      } catch (error) {
        // If the fetch fails, it's very likely an ad blocker
        setIsAdBlockerDetected(true);
        return;
      }

      // As a fallback, create a div that might be hidden by ad blockers
      const adDiv = document.createElement('div');
      adDiv.innerHTML = '&nbsp;';
      adDiv.className = 'ad-banner advertisement'; // Common ad blocker targets
      adDiv.style.position = 'absolute';
      adDiv.style.top = '-5000px';
      adDiv.style.left = '-5000px';
      document.body.appendChild(adDiv);

      // Wait a moment for the ad blocker to potentially hide the div
      setTimeout(() => {
        if (adDiv.offsetHeight === 0) {
          setIsAdBlockerDetected(true);
        }
        document.body.removeChild(adDiv);
      }, 100);
    };

    checkAdBlocker();
  }, []);

  return isAdBlockerDetected;
};