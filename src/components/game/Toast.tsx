'use client';

interface ToastProps {
  message: string | null;
}

// Auto-dismissing inline message above the board. Doubles as the
// screen-reader live region for important transient announcements
// (invalid word, hard-mode violation, win/loss).
export default function Toast({ message }: ToastProps) {
  return (
    <div
      aria-live="polite"
      role="status"
      className="min-h-[2rem] flex items-start justify-center pointer-events-none"
    >
      {message ? (
        <span
          className="px-3 py-1 rounded text-sm font-medium"
          style={{
            background: 'var(--hoolah-fg)',
            color: 'var(--hoolah-bg)',
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
