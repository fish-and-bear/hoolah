'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Only register on deployed HTTPS origins. Local preview servers
    // frequently serve stale /sw.js while developing.
    if (
      ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
    ) {
      return;
    }
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
