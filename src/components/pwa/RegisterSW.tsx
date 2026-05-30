'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Only register on production builds. The dev server doesn't
    // expose /sw.js the way we want.
    if (window.location.hostname === 'localhost') return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failures are non-fatal; the site still works
        // as a normal web page.
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
