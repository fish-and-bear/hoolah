'use client';

import { useEffect, useState } from 'react';
import { formatCountdown, msUntilNextManilaMidnight } from '@/lib/time';

export default function Countdown() {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setMs(msUntilNextManilaMidnight());
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (ms === null) return null;
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {formatCountdown(ms)}
    </span>
  );
}
